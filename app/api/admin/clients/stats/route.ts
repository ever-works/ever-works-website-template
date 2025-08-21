import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getClientStats } from '@/lib/db/queries';

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

    // Get client statistics efficiently using GROUP BY
    const stats = await getClientStats();

    // Transform to expected format
    const statsByStatus = {
      total: stats.total,
      active: stats.byStatus.find(s => s.status === 'active')?.count || 0,
      inactive: stats.byStatus.find(s => s.status === 'inactive')?.count || 0,
      suspended: stats.byStatus.find(s => s.status === 'suspended')?.count || 0,
      trial: stats.byStatus.find(s => s.status === 'trial')?.count || 0,
    };

    return NextResponse.json({
      success: true,
      data: statsByStatus
    });

  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch client stats' 
    }, { status: 500 });
  }
}
