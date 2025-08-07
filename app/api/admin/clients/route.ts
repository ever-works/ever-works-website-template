import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getClients } from '@/lib/db/queries';

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

    const result = await getClients({
      page,
      limit,
      search,
      status,
      plan,
      accountType,
    });

    // Return in the expected format with meta and data
    return NextResponse.json({
      success: true,
      data: { clients: result.clients },
      meta: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        limit: result.limit,
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
} 