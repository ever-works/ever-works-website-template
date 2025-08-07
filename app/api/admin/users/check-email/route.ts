import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRepository } from '@/lib/repositories/user.repository';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { email, excludeId } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check email availability
    const userRepository = new UserRepository();
    const exists = await userRepository.emailExists(email, excludeId);

    return NextResponse.json({ 
      available: !exists,
      exists 
    });
  } catch (error) {
    console.error('Error in POST /api/admin/users/check-email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 