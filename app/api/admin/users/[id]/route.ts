import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRepository } from '@/lib/repositories/user.repository';
import { RoleRepository } from '@/lib/repositories/role.repository';
import { UpdateUserRequest, isValidUserStatus } from '@/lib/types/user';
import { isValidEmail } from '@/lib/utils/email-validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get user
    const userRepository = new UserRepository();
    const user = await userRepository.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Parse request body
    const body = await request.json();

    // Validate request body structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate email format if provided
    if (body.email !== undefined) {
      if (typeof body.email !== 'string') {
        return NextResponse.json({ error: 'Email must be a string' }, { status: 400 });
      }
      if (!isValidEmail(body.email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
    }

    // Validate username if provided
    if (body.username !== undefined) {
      if (typeof body.username !== 'string') {
        return NextResponse.json({ error: 'Username must be a string' }, { status: 400 });
      }
      if (body.username.trim().length < 3 || body.username.trim().length > 50) {
        return NextResponse.json({ error: 'Username must be between 3 and 50 characters' }, { status: 400 });
      }
    }

    // Validate name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json({ error: 'Name must be a string' }, { status: 400 });
      }
      if (body.name.trim().length < 2 || body.name.trim().length > 100) {
        return NextResponse.json({ error: 'Name must be between 2 and 100 characters' }, { status: 400 });
      }
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

    // Validate role if provided
    if (body.role !== undefined) {
      if (typeof body.role !== 'string') {
        return NextResponse.json({ error: 'Role must be a string' }, { status: 400 });
      }
      if (body.role.trim().length === 0) {
        return NextResponse.json({ error: 'Role cannot be empty' }, { status: 400 });
      }
      
      // Check if role exists in the system
      const roleRepository = new RoleRepository();
      const roleExists = await roleRepository.findById(body.role);
      if (!roleExists) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
    }

    // Validate status if provided
    if (body.status !== undefined) {
      if (!isValidUserStatus(body.status)) {
        return NextResponse.json({ error: 'Invalid status. Must be "active" or "inactive"' }, { status: 400 });
      }
    }

    const userData: UpdateUserRequest = {
      username: body.username,
      email: body.email,
      name: body.name,
      title: body.title,
      avatar: body.avatar,
      role: body.role,
      status: body.status,
    };

    // Update user
    const userRepository = new UserRepository();
    const updatedUser = await userRepository.update(id, userData);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[id]:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user
    const userRepository = new UserRepository();
    await userRepository.delete(id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    
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