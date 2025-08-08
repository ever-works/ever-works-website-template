import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  createClientProfile, 
  getClientProfiles, 
  updateClientProfile, 
  deleteClientProfile,
  getUserByEmail
} from '@/lib/db/queries';
import { UserDbService } from '@/lib/services/user-db.service';
import crypto from 'crypto';

// Type definitions for request bodies
interface CreateClientRequest {
  userId: string; // This will be the email address
  displayName?: string;
  username?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  phone?: string;
  website?: string;
  location?: string;
  accountType?: 'individual' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  plan?: 'free' | 'standard' | 'premium';
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  totalSubmissions?: number;
}

interface UpdateClientRequest {
  id: string;
  displayName?: string;
  username?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  phone?: string;
  website?: string;
  location?: string;
  accountType?: 'individual' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  plan?: 'free' | 'standard' | 'premium';
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
}

interface DeleteClientRequest {
  id: string;
}

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


    const result = await getClientProfiles({
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
      data: { clients: result.profiles },
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

    const body = await request.json() as CreateClientRequest;
    
    // Validate required fields
    if (!body.userId) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists, if not create one
    let user = await getUserByEmail(body.userId);
    
    if (!user) {
      try {
        // Create a new user with the email
        const userService = new UserDbService();
        
        // Generate a cryptographically secure temporary password
        const randomBytes = crypto.randomBytes(6);
        const randomString = randomBytes.toString('hex').toLowerCase();
        const tempPassword = `Temp${randomString}!`;
        
        // Generate username from email if not provided
        const username = body.username || body.userId.split('@')[0];
        
        // Generate name from display name or email prefix
        const name = body.displayName || body.userId.split('@')[0];
        
        const newUser = await userService.createUser({
          username,
          email: body.userId,
          name,
          role: 'client', // Default role for clients
          password: tempPassword,
        }, session.user.id || 'system');
        
        user = newUser;
      } catch (userError) {
        console.error('Error creating user for client:', userError);
        return NextResponse.json(
          { error: `Failed to create user: ${userError instanceof Error ? userError.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    // Ensure we have a valid user
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Failed to create or find user for client' },
        { status: 400 }
      );
    }

    // Create client with the actual user ID
    const clientData = {
      userId: user.id,
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

    const newClient = await createClientProfile(clientData);

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

    const body = await request.json() as UpdateClientRequest;
    
    // Validate required fields for update
    if (!body.id) {
      return NextResponse.json({ 
        error: 'Client ID is required for updates' 
      }, { status: 400 });
    }

    // Create the update data object
    const updateData = {
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

    const updatedClient = await updateClientProfile(body.id, updateData);

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

    const body = await request.json() as DeleteClientRequest;
    
    // Validate required fields for deletion
    if (!body.id) {
      return NextResponse.json({ 
        error: 'Client ID is required for deletion' 
      }, { status: 400 });
    }

    const success = await deleteClientProfile(body.id);

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