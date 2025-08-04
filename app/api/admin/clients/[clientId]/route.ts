import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getClientById, 
  updateClient, 
  deleteClient, 
  getClientWithUser 
} from '@/lib/db/queries';
import type { 
  UpdateClientRequest, 
  ClientResponse 
} from '@/lib/types/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = params;
    const client = await getClientWithUser(clientId);

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
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = params;
    const data: UpdateClientRequest = await request.json();

    // Check if client exists
    const existingClient = await getClientById(clientId);
    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const updatedClient = await updateClient(clientId, {
      companyName: data.companyName,
      clientType: data.clientType,
      phone: data.phone,
      website: data.website,
      country: data.country,
      city: data.city,
      jobTitle: data.jobTitle,
      status: data.status,
      plan: data.plan,
      preferredContactMethod: data.preferredContactMethod,
      marketingConsent: data.marketingConsent,
      notes: data.notes
    });

    if (!updatedClient) {
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Client updated successfully'
    });
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
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = params;

    // Check if client exists
    const existingClient = await getClientById(clientId);
    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const deletedClient = await deleteClient(clientId);

    if (!deletedClient) {
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
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