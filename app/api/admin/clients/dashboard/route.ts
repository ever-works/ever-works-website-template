import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Starting dashboard request');
    
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    console.log('API: Parsed search params');
    
    // Pagination with validation
    const rawPage = Number(searchParams.get('page') ?? 1);
    const rawLimit = Number(searchParams.get('limit') ?? 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(1, Math.floor(rawLimit)), 100) : 10;

    // Parse all search parameters
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const plan = searchParams.get('plan') || undefined;
    const accountType = searchParams.get('accountType') || undefined;
    const provider = searchParams.get('provider') || undefined;
    
    // Date parameters with validation
    const parseDate = (v: string | null) => {
      if (!v) return undefined;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };
    const createdAfter = parseDate(searchParams.get('createdAfter'));
    const createdBefore = parseDate(searchParams.get('createdBefore'));
    const updatedAfter = parseDate(searchParams.get('updatedAfter'));
    const updatedBefore = parseDate(searchParams.get('updatedBefore'));

    console.log('API: About to build dashboard data with filters:', {
      search, status, plan, accountType, provider,
      createdAfter, createdBefore, updatedAfter, updatedBefore
    });

    // Use the existing function that handles all filtering and stats
    const result = await getAdminDashboardData({
      page,
      limit,
      search,
      status,
      plan,
      accountType,
      provider,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    });
    
    console.log('API: Dashboard data query completed successfully');

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
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
