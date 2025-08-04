import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRepository } from '@/lib/repositories/user.repository';
import { CreateUserRequest, UserListOptions } from '@/lib/types/user';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') as 'active' | 'inactive' | undefined;
    const sortBy = searchParams.get('sortBy') as 'name' | 'username' | 'email' | 'role' | 'created_at' | undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build options object
    const options: UserListOptions = {
      page,
      limit,
      search,
      role,
      status,
      sortBy,
      sortOrder,
      includeInactive,
    };

    // Get users
    const userRepository = new UserRepository();
    const result = await userRepository.findAll(options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const userData: CreateUserRequest = {
      username: body.username,
      email: body.email,
      name: body.name,
      title: body.title,
      avatar: body.avatar,
      role: body.role,
      password: body.password,
    };

    // Create user
    const userRepository = new UserRepository();
    const newUser = await userRepository.create(userData, session.user.id || 'system');

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 