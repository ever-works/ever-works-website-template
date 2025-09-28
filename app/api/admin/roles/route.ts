import { NextRequest, NextResponse } from 'next/server';
import { RoleRepository } from '@/lib/repositories/role.repository';
import type { CreateRoleRequest, RoleStatus } from '@/lib/types/role';

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
      success: true,
      roles: result.roles,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const roleData: CreateRoleRequest = body;

    // Validate required fields
    if (!roleData.name || !roleData.description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Generate stable ID from name (normalize, strip diacritics, collapse/trim hyphens)
    const id = roleData.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);

    if (!id) {
      return NextResponse.json({ success: false, error: 'Unable to derive a valid role ID from name' }, { status: 400 });
    }

    // Validate name length
    if (roleData.name.length < 3 || roleData.name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Role name must be between 3 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate description length
    if (roleData.description.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Role description must be at most 500 characters' },
        { status: 400 }
      );
    }

    // Check for duplicate ID (including soft-deleted records)
    const isDuplicate = await roleRepository.exists(id, { includeDeleted: true });
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: 'Role with similar name already exists' },
        { status: 409 }
      );
    }

    // Create the role data with proper structure
    const createData = {
      id,
      name: roleData.name,
      description: roleData.description,
      status: roleData.status || 'active',
      isAdmin: roleData.isAdmin || false,
      permissions: [], // Empty for now
    };

    // Create the role
    const newRole = await roleRepository.create(createData);

    return NextResponse.json(
      { success: true, role: newRole, message: 'Role created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating role:', error);

    if (error instanceof Error) {
      if (error.message.includes('already exists') ||
          error.message.includes('unique constraint') ||
          error.message.includes('duplicate key')) {
        return NextResponse.json(
          { success: false, error: 'Role with similar name already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
} 