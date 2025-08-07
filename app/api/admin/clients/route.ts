import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/db/queries';

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

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields for update
    if (!body.userId || !body.provider || !body.providerAccountId) {
      return NextResponse.json({ 
        error: 'User ID, provider, and provider account ID are required for updates' 
      }, { status: 400 });
    }

    // Create the update data object with the required fields for the updateClient function
    const updateData = {
      userId: body.userId,
      provider: body.provider,
      providerAccountId: body.providerAccountId,
      displayName: body.displayName,
      username: body.username,
      bio: body.bio,
      jobTitle: body.jobTitle,
      company: body.company,
      industry: body.industry,
      phone: body.phone,
      website: body.website,
      location: body.location,
      accountType: body.accountType,
      status: body.status,
      plan: body.plan,
      timezone: body.timezone,
      language: body.language,
      twoFactorEnabled: body.twoFactorEnabled,
      emailVerified: body.emailVerified,
    };

    const updatedClient = await updateClient(
      body.userId, 
      body.provider, 
      body.providerAccountId, 
      updateData
    );

    if (!updatedClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: 'Client updated successfully',
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields for deletion
    if (!body.userId || !body.provider || !body.providerAccountId) {
      return NextResponse.json({ 
        error: 'User ID, provider, and provider account ID are required for deletion' 
      }, { status: 400 });
    }

    const success = await deleteClient(body.userId, body.provider, body.providerAccountId);

    if (!success) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 