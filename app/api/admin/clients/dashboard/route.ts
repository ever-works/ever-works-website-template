import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const plan = searchParams.get('plan') || undefined;
    const accountType = searchParams.get('accountType') || undefined;
    const provider = searchParams.get('provider') || undefined;

    const result = await getAdminDashboardData({
      page,
      limit,
      search,
      status,
      plan,
      accountType,
      provider,
    });

    return NextResponse.json({
      success: true,
      data: {
        clients: result.clients,
        stats: result.stats,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
