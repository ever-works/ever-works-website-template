import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEnhancedClientStats } from '@/lib/db/queries';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (!session.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get comprehensive client statistics
    const stats = await getEnhancedClientStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch client stats' 
    }, { status: 500 });
  }
}
