import { NextRequest, NextResponse } from 'next/server';
import { RoleRepository } from '@/lib/repositories/role.repository';
import { CreateRoleRequest, RoleStatus } from '@/lib/types/role';
import { isValidPermission } from '@/lib/permissions/definitions';

const roleRepository = new RoleRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const statusParam = searchParams.get('status');
    const status: RoleStatus | undefined = statusParam === 'active' || statusParam === 'inactive' ? statusParam as RoleStatus : undefined;
    const sortBy = searchParams.get('sortBy') as 'name' | 'id' | 'created_at' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    // Validate parameters
    const options = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      status,
      sortBy: sortBy || 'name',
      sortOrder: sortOrder || 'asc',
    };

    const result = await roleRepository.findAllPaginated(options);
    
    return NextResponse.json({
      roles: result.roles,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const roleData: CreateRoleRequest = body;

    // Validate required fields
    if (!roleData.id || !roleData.name || !roleData.description) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, description' },
        { status: 400 }
      );
    }

    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(roleData.id)) {
      return NextResponse.json(
        { error: 'Role ID can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Validate ID length
    if (roleData.id.length < 3 || roleData.id.length > 50) {
      return NextResponse.json(
        { error: 'Role ID must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate name length
    if (roleData.name.length < 3 || roleData.name.length > 100) {
      return NextResponse.json(
        { error: 'Role name must be between 3 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate description length
    if (roleData.description.length > 500) {
      return NextResponse.json(
        { error: 'Role description must be at most 500 characters' },
        { status: 400 }
      );
    }

    // Check for duplicate ID
    const isDuplicate = await roleRepository.checkDuplicateId(roleData.id);
    if (isDuplicate) {
      return NextResponse.json(
        { error: `Role with ID '${roleData.id}' already exists` },
        { status: 409 }
      );
    }

    // Validate permissions
    if (!Array.isArray(roleData.permissions)) {
      return NextResponse.json(
        { error: 'Permissions must be an array' },
        { status: 400 }
      );
    }

    const invalidPermissions = roleData.permissions.filter(p => !isValidPermission(p));
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: `Invalid permissions: ${invalidPermissions.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the role
    const newRole = await roleRepository.create(roleData);
    
    return NextResponse.json(
      { role: newRole, message: 'Role created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating role:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
} 