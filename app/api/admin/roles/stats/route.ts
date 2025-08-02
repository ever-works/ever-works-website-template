import { NextResponse } from 'next/server';
import { RoleRepository } from '@/lib/repositories/role.repository';

const roleRepository = new RoleRepository();

export async function GET() {
  try {
    const roles = await roleRepository.findAll();
    
    const total = roles.length;
    const active = roles.filter(role => role.isActive).length;
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
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching role stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role statistics' },
      { status: 500 }
    );
  }
} 