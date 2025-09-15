import { NextResponse } from 'next/server';
import { RoleRepository } from '@/lib/repositories/role.repository';

const roleRepository = new RoleRepository();

export async function GET() {
  try {
    const activeRoles = await roleRepository.findActive();

    return NextResponse.json({
      roles: activeRoles,
    });
  } catch (error) {
    console.error('Error fetching active roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active roles' },
      { status: 500 }
    );
  }
}