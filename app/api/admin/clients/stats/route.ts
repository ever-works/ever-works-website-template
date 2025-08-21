import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getClientProfiles } from '@/lib/db/queries';

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

    // Compute counts via DB totals to avoid scanning large datasets
    const [activeRes, inactiveRes, suspendedRes, trialRes] = await Promise.all(
      (['active', 'inactive', 'suspended', 'trial'] as const).map((status) =>
        getClientProfiles({ page: 1, limit: 1, status })
      )
    );

    const stats = {
      total:
        activeRes.total +
        inactiveRes.total +
        suspendedRes.total +
        trialRes.total,
      active: activeRes.total,
      inactive: inactiveRes.total,
      suspended: suspendedRes.total,
      trial: trialRes.total,
    };

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
