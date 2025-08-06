import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRepository } from '@/lib/repositories/user.repository';
import { CreateUserRequest, UserListOptions } from '@/lib/types/user';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Validate and constrain numeric parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10') || 10));
    
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') as 'active' | 'inactive' | undefined;
    
    // Validate status value
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
    }
    
    const sortBy = searchParams.get('sortBy') as 'name' | 'username' | 'email' | 'role' | 'created_at' | undefined;
    
    // Validate sortBy value
    const validSortFields = ['name', 'username', 'email', 'role', 'created_at'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      return NextResponse.json({ error: 'Invalid sortBy parameter' }, { status: 400 });
    }
    
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;
    
    // Validate sortOrder value
    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json({ error: 'Invalid sortOrder parameter' }, { status: 400 });
    }
    
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    // Validate search parameter length
    if (search && search.length > 100) {
      return NextResponse.json({ error: 'Search parameter too long' }, { status: 400 });
    }
    
    // Validate role parameter length
    if (role && role.length > 50) {
      return NextResponse.json({ error: 'Role parameter too long' }, { status: 400 });
    }

    // Build options object
    const options: UserListOptions = {
      page,
      limit,
      search,
      role,
      status,
      sortBy,
      sortOrder,
      includeInactive,
    };

    // Get users
    const userRepository = new UserRepository();
    const result = await userRepository.findAll(options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const userData: CreateUserRequest = {
      username: body.username,
      email: body.email,
      name: body.name,
      title: body.title,
      avatar: body.avatar,
      role: body.role,
      password: body.password,
    };

    // Create user
    const userRepository = new UserRepository();
    const newUser = await userRepository.create(userData, session.user.id || 'system');

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 