import { db } from './drizzle';
import { permissions, roles, rolePermissions, type Permission, type Role } from './schema';

/**
 * Seed initial permissions
 */
export async function seedPermissions() {
  const initialPermissions = [
    { key: 'read:own', description: 'Can read own data' },
    { key: 'write:own', description: 'Can write own data' },
    { key: 'admin:all', description: 'Full administrative access' },
    { key: 'client:manage', description: 'Can manage client-specific operations' },
    { key: 'user:read', description: 'Can read user data' },
    { key: 'user:write', description: 'Can write user data' },
  ];

  for (const permission of initialPermissions) {
    await db
      .insert(permissions)
      .values({
        key: permission.key,
        description: permission.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  console.log('✅ Permissions seeded successfully');
}

/**
 * Link roles to permissions
 */
export async function linkRolesToPermissions() {
  // Get existing roles
  const existingRoles: Role[] = await db.select().from(roles);
  
  // Get permissions
  const allPermissions: Permission[] = await db.select().from(permissions);
  
  // Create role-permission mappings
  const rolePermissionMappings = [
    // Admin role gets all permissions
    ...allPermissions.map((permission: Permission) => ({
      roleName: 'admin',
      permissionKey: permission.key,
    })),
    // Client role gets basic permissions
    {
      roleName: 'client',
      permissionKey: 'read:own',
    },
    {
      roleName: 'client',
      permissionKey: 'write:own',
    },
    {
      roleName: 'client',
      permissionKey: 'client:manage',
    },
  ];

  for (const mapping of rolePermissionMappings) {
    const role = existingRoles.find((r: Role) => r.name === mapping.roleName);
    const permission = allPermissions.find((p: Permission) => p.key === mapping.permissionKey);

    if (role && permission) {
      await db
        .insert(rolePermissions)
        .values({
          roleId: role.id,
          permissionId: permission.id,
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }
  }

  console.log('✅ Role-permission mappings created successfully');
}

/**
 * Main seed function
 */
export async function seedRolesAndPermissions() {
  try {
    await seedPermissions();
    await linkRolesToPermissions();
    console.log('✅ Role and permission seeding completed');
  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedRolesAndPermissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
