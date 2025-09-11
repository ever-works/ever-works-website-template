import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { checkAdminAuth } from '@/lib/auth/admin-guard';

export async function GET() {
  try {
    // Check admin authentication
    const authError = await checkAdminAuth();
    if (authError) {
      return authError;
    }

    // Get user statistics
    const userRepository = new UserRepository();
    const stats = await userRepository.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/users/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 