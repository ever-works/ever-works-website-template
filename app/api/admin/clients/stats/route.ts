import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getClientProfiles } from '@/lib/db/queries';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Get all clients to calculate stats
    const result = await getClientProfiles({
      page: 1,
      limit: 1000, // Get a large number to count all
    });

    const { profiles: clients } = result;

    const stats = {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      inactive: clients.filter(c => c.status === 'inactive').length,
      suspended: clients.filter(c => c.status === 'suspended').length,
      trial: clients.filter(c => c.status === 'trial').length,
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
