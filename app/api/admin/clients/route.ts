import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  createClientProfile, 
  getClientProfiles, 
  getUserByEmail
} from '@/lib/db/queries';
import { UserDbService } from '@/lib/services/user-db.service';
import crypto from 'crypto';

// Type definitions for request bodies
interface CreateClientRequest {
  /** @deprecated use `email` instead */
  userId?: string;
  email: string;
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

    const raw = await request.json() as Partial<CreateClientRequest>;
    const email = raw.email ?? raw.userId;
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists, if not create one
    let user = await getUserByEmail(email);
    
    if (!user) {
      try {
        // Create a new user with the email
        const userService = new UserDbService();
        
        // Generate a cryptographically secure temporary password
        const randomBytes = crypto.randomBytes(6);
        const randomString = randomBytes.toString('hex').toLowerCase();
        const tempPassword = `Temp${randomString}!`;
        
        // Generate username from email if not provided
        const username = raw.username || email.split('@')[0];
        
        // Generate name from display name or email prefix
        const name = raw.displayName || email.split('@')[0];
        
        const newUser = await userService.createUser({
          username,
          email: email,
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
      displayName: raw.displayName || null,
      username: raw.username || null,
      bio: raw.bio || null,
      jobTitle: raw.jobTitle || null,
      company: raw.company || null,
      industry: raw.industry || null,
      phone: raw.phone || null,
      website: raw.website || null,
      location: raw.location || null,
      accountType: raw.accountType || 'individual',
      status: raw.status || 'active',
      plan: raw.plan || 'free',
      timezone: raw.timezone || 'UTC',
      language: raw.language || 'en',
      twoFactorEnabled: raw.twoFactorEnabled || false,
      emailVerified: raw.emailVerified || false,
      totalSubmissions: raw.totalSubmissions || 0,
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

 