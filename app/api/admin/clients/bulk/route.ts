import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateClient, deleteClient } from '@/lib/db/queries';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate that we have a valid array of client updates
    if (!Array.isArray(body.clients) || body.clients.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request: clients array is required' 
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each client update
    for (const [index, clientData] of body.clients.entries()) {
      try {
        // Validate required fields for each client
        if (!clientData.userId || !clientData.provider || !clientData.providerAccountId) {
          errors.push({
            index,
            error: 'User ID, provider, and provider account ID are required',
            clientData
          });
          continue;
        }

        const updateData = {
          userId: clientData.userId,
          provider: clientData.provider,
          providerAccountId: clientData.providerAccountId,
          displayName: clientData.displayName,
          username: clientData.username,
          bio: clientData.bio,
          jobTitle: clientData.jobTitle,
          company: clientData.company,
          industry: clientData.industry,
          phone: clientData.phone,
          website: clientData.website,
          location: clientData.location,
          accountType: clientData.accountType,
          status: clientData.status,
          plan: clientData.plan,
          timezone: clientData.timezone,
          language: clientData.language,
          twoFactorEnabled: clientData.twoFactorEnabled,
          emailVerified: clientData.emailVerified,
        };

        const updatedClient = await updateClient(
          clientData.userId,
          clientData.provider,
          clientData.providerAccountId,
          updateData
        );

        if (updatedClient) {
          results.push({
            index,
            success: true,
            data: updatedClient
          });
        } else {
          errors.push({
            index,
            error: 'Client not found',
            clientData
          });
        }
      } catch (error) {
        errors.push({
          index,
          error: error instanceof Error ? error.message : 'Unknown error',
          clientData
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk update completed: ${results.length} successful, ${errors.length} failed`,
      results,
      errors,
      summary: {
        total: body.clients.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Error in bulk client update:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk update' },
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
    
    // Validate that we have a valid array of client identifiers
    if (!Array.isArray(body.clients) || body.clients.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request: clients array is required' 
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each client deletion
    for (const [index, clientData] of body.clients.entries()) {
      try {
        // Validate required fields for each client
        if (!clientData.userId || !clientData.provider || !clientData.providerAccountId) {
          errors.push({
            index,
            error: 'User ID, provider, and provider account ID are required',
            clientData
          });
          continue;
        }

        const success = await deleteClient(
          clientData.userId,
          clientData.provider,
          clientData.providerAccountId
        );

        if (success) {
          results.push({
            index,
            success: true,
            clientId: `${clientData.userId}:${clientData.provider}:${clientData.providerAccountId}`
          });
        } else {
          errors.push({
            index,
            error: 'Client not found',
            clientData
          });
        }
      } catch (error) {
        errors.push({
          index,
          error: error instanceof Error ? error.message : 'Unknown error',
          clientData
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk deletion completed: ${results.length} successful, ${errors.length} failed`,
      results,
      errors,
      summary: {
        total: body.clients.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Error in bulk client deletion:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk deletion' },
      { status: 500 }
    );
  }
}