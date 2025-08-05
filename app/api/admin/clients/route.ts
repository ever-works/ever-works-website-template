import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClients, getClientStats, createClientForManualUser, getUserByEmail } from "@/lib/db/queries";
import type { CreateClientRequest, ClientListResponse } from "@/lib/types/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as any;
    const plan = searchParams.get('plan') as any;
    const accountType = searchParams.get('accountType') as any;
    const sortBy = searchParams.get('sortBy') as any;
    const sortOrder = searchParams.get('sortOrder') as any;

    const offset = (page - 1) * limit;

    const options = {
      page,
      limit,
      offset,
      search,
      status,
      plan,
      accountType,
      sortBy,
      sortOrder
    };

    const clients = await getClients(options);
    const stats = await getClientStats();

    const totalPages = Math.ceil(stats.total / limit);

    const response: ClientListResponse = {
      success: true,
      clients,
      total: stats.total,
      page,
      limit,
      totalPages
    };

    return NextResponse.json(response);
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

    const data: CreateClientRequest = await request.json();

    // Check if user exists
    const user = await getUserByEmail(data.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please ensure the user has registered first.' },
        { status: 404 }
      );
    }

    // Create client account for manual email user
    const client = await createClientForManualUser(user.id, {
      displayName: data.displayName,
      username: data.username,
      bio: data.bio,
      jobTitle: data.jobTitle,
      company: data.company,
      industry: data.industry,
      phone: data.phone,
      website: data.website,
      location: data.location,
      accountType: data.accountType || 'individual',
      timezone: data.timezone || 'UTC',
      language: data.language || 'en',
    });

    return NextResponse.json({
      success: true,
      client,
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 