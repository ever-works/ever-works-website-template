import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getClients, createClient } from '@/lib/db/queries';

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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Create client with the provided data
    const clientData = {
      userId: body.userId,
      displayName: body.displayName || null,
      username: body.username || null,
      bio: body.bio || null,
      jobTitle: body.jobTitle || null,
      company: body.company || null,
      industry: body.industry || null,
      phone: body.phone || null,
      website: body.website || null,
      location: body.location || null,
      accountType: body.accountType || 'individual',
      status: body.status || 'active',
      plan: body.plan || 'free',
      timezone: body.timezone || 'UTC',
      language: body.language || 'en',
      twoFactorEnabled: body.twoFactorEnabled || false,
      emailVerified: body.emailVerified || false,
      totalSubmissions: body.totalSubmissions || 0,
    };

    const newClient = await createClient(clientData);

    return NextResponse.json({
      success: true,
      data: newClient,
      message: 'Client created successfully',
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 