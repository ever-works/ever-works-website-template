import { db } from './drizzle';
import { roles, userRoles, permissions, rolePermissions } from './schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get all roles assigned to a user
 */
export async function getUserRoles(userId: string) {
  const result = await db
    .select({
      roleId: userRoles.roleId,
      roleName: roles.name,
      roleDescription: roles.description,
      roleStatus: roles.status,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return result;
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const result = await db
    .select({ roleId: roles.id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(roles.name, roleName),
        eq(roles.status, 'active')
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const result = await db
    .select({ permissionId: permissions.id })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(permissions.key, permissionKey),
        eq(roles.status, 'active')
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
  try {
    // Validate that the role exists and is active
    const activeRole = await db.select({ id: roles.id, status: roles.status })
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.status, 'active')))
      .limit(1);
    
    if (!activeRole.length) {
      throw new Error(`Role ${roleId} does not exist or is not active`);
    }

    const result = await db
      .insert(userRoles)
      .values({
        userId,
        roleId,
        createdAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    return result.length > 0; // true if newly assigned, false if already present
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      )
      .returning();

    return result.length > 0; // true if role was removed, false if role wasn't assigned
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
}

/**
 * Get all permissions for a user (through their roles)
 */
export async function getUserPermissions(userId: string) {
  const result = await db
    .select({
      permissionId: permissions.id,
      permissionKey: permissions.key,
      permissionDescription: permissions.description,
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(roles.status, 'active')
      )
    );

  return result;
}

/**
 * Check if a user is an admin (has admin role)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin');
}

/**
 * Check if a user is a client (has client role)
 */
export async function isClient(userId: string): Promise<boolean> {
  return hasRole(userId, 'client');
}
