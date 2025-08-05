import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientWithUser, updateClient, deleteClient } from "@/lib/db/queries";
import type { UpdateClientRequest, ClientResponse } from "@/lib/types/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    // Parse the clientId which should be in format: userId:provider:providerAccountId
    const [userId, provider, providerAccountId] = clientId.split(':');
    
    if (!userId || !provider || !providerAccountId) {
      return NextResponse.json(
        { error: 'Invalid client ID format' },
        { status: 400 }
      );
    }

    const client = await getClientWithUser(userId, provider, providerAccountId);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ClientResponse = {
      success: true,
      client
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    // Parse the clientId which should be in format: userId:provider:providerAccountId
    const [userId, provider, providerAccountId] = clientId.split(':');
    
    if (!userId || !provider || !providerAccountId) {
      return NextResponse.json(
        { error: 'Invalid client ID format' },
        { status: 400 }
      );
    }

    const data: UpdateClientRequest = await request.json();

    const client = await updateClient(userId, provider, providerAccountId, data);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ClientResponse = {
      success: true,
      client,
      message: 'Client updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    // Parse the clientId which should be in format: userId:provider:providerAccountId
    const [userId, provider, providerAccountId] = clientId.split(':');
    
    if (!userId || !provider || !providerAccountId) {
      return NextResponse.json(
        { error: 'Invalid client ID format' },
        { status: 400 }
      );
    }

    const success = await deleteClient(userId, provider, providerAccountId);

    if (!success) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 