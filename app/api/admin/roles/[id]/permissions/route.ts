import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin-guard';
import { RoleDbService } from '@/lib/services/role-db.service';
import { Permission, isValidPermission } from '@/lib/permissions/definitions';

const roleService = new RoleDbService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const { success, error } = await isAdminUser();
    if (!success) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const roleId = params.id;
    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'Role ID is required' },
        { status: 400 }
      );
    }

    const role = await roleService.findById(roleId);
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      permissions: role.permissions || [],
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin permissions
    const { success, error } = await isAdminUser();
    if (!success) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const roleId = params.id;
    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { permissions } = body;

    // Validate permissions
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'Permissions must be an array' },
        { status: 400 }
      );
    }

    // Validate each permission
    const invalidPermissions = permissions.filter(
      (permission: unknown) => typeof permission !== 'string' || !isValidPermission(permission)
    );

    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid permissions detected',
          invalidPermissions
        },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await roleService.findById(roleId);
    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Update role permissions
    const updatedRole = await roleService.updateRole(roleId, {
      permissions: permissions as Permission[]
    });

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully',
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: updatedRole.permissions,
      },
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}