import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRepository } from '@/lib/repositories/user.repository';
import { RoleRepository } from '@/lib/repositories/role.repository';
import { CreateUserRequest, UserListOptions } from '@/lib/types/user';
import { isValidEmail } from '@/lib/utils/email-validation';

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

    return NextResponse.json({
      success: true,
      data: result.users,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
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

    // Validate request body structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate required fields
    if (!body.username || !body.email || !body.name || !body.password || !body.role) {
      return NextResponse.json({ error: 'Missing required fields: username, email, name, password, and role are required' }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate username format (alphanumeric, dash, underscore)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(body.username)) {
      return NextResponse.json({ error: 'Username must be 3-30 characters and contain only letters, numbers, dashes, and underscores' }, { status: 400 });
    }

    // Validate name length
    if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters' }, { status: 400 });
    }

    // Validate password strength
    if (typeof body.password !== 'string' || body.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Validate title if provided
    if (body.title !== undefined && body.title !== null) {
      if (typeof body.title !== 'string') {
        return NextResponse.json({ error: 'Title must be a string' }, { status: 400 });
      }
      if (body.title.length > 100) {
        return NextResponse.json({ error: 'Title must be at most 100 characters' }, { status: 400 });
      }
    }

    // Validate avatar if provided
    if (body.avatar !== undefined && body.avatar !== null) {
      if (typeof body.avatar !== 'string') {
        return NextResponse.json({ error: 'Avatar must be a string' }, { status: 400 });
      }
      if (body.avatar.length > 500) {
        return NextResponse.json({ error: 'Avatar URL must be at most 500 characters' }, { status: 400 });
      }
    }

    // Validate role exists in the system
    if (typeof body.role !== 'string' || body.role.trim().length === 0) {
      return NextResponse.json({ error: 'Role cannot be empty' }, { status: 400 });
    }
    
    const roleRepository = new RoleRepository();
    const roleExists = await roleRepository.findById(body.role);
    if (!roleExists) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const userData: CreateUserRequest = {
      username: body.username.trim(),
      email: body.email.trim().toLowerCase(),
      name: body.name.trim(),
      title: body.title?.trim() || undefined,
      avatar: body.avatar?.trim() || undefined,
      role: body.role.trim(),
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