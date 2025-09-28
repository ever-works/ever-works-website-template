import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RoleRepository } from '@/lib/repositories/role.repository';

const roleRepository = new RoleRepository();

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (!session.user.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const roles = await roleRepository.findAll();
    
    const total = roles.length;
    const active = roles.filter(role => role.status === 'active').length;
    const inactive = total - active;
    
    // Calculate average permissions per role
    const totalPermissions = roles.reduce((sum, role) => sum + role.permissions.length, 0);
    const averagePermissions = total > 0 ? totalPermissions / total : 0;
    
    const stats = {
      total,
      active,
      inactive,
      averagePermissions: Math.round(averagePermissions * 10) / 10, // Round to 1 decimal place
    };
    
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching role stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role statistics' },
      { status: 500 }
    );
  }
} 