import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RoleRepository } from '@/lib/repositories/role.repository';
import { UpdateRoleRequest } from '@/lib/types/role';
import { UpdateRoleRequest as HookUpdateRoleRequest } from '@/hooks/use-admin-roles';

const roleRepository = new RoleRepository();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    
    const role = await roleRepository.findById(id);
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();
    const updateData: HookUpdateRoleRequest = body;

    // Check if role exists
    const existingRole = await roleRepository.findById(id);
    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Validate name if provided
    if (updateData.name !== undefined) {
      if (!updateData.name.trim()) {
        return NextResponse.json(
          { error: 'Role name cannot be empty' },
          { status: 400 }
        );
      }
      if (updateData.name.length < 3 || updateData.name.length > 100) {
        return NextResponse.json(
          { error: 'Role name must be between 3 and 100 characters' },
          { status: 400 }
        );
      }
    }

    // Validate description if provided
    if (updateData.description !== undefined) {
      if (updateData.description.length > 500) {
        return NextResponse.json(
          { error: 'Role description must be at most 500 characters' },
          { status: 400 }
        );
      }
    }

    // Convert hook type to repository type (excluding permissions due to type mismatch)
    const repositoryUpdateData: UpdateRoleRequest = {
      id,
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      ...(updateData.isAdmin !== undefined && { isAdmin: updateData.isAdmin }),
    };

    // Update the role using repository
    const updatedRole = await roleRepository.update(id, repositoryUpdateData);
    
    return NextResponse.json(
      { role: updatedRole, message: 'Role updated successfully' }
    );
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Check if role exists
    const existingRole = await roleRepository.findById(id);
    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (hardDelete) {
      await roleRepository.hardDelete(id);
      return NextResponse.json(
        { message: 'Role permanently deleted' }
      );
    } else {
      await roleRepository.delete(id);
      return NextResponse.json(
        { message: 'Role deleted (marked as inactive)' }
      );
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
} 