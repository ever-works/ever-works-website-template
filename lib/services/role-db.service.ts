import { db } from '@/lib/db/drizzle';
import { roles, permissions, rolePermissions } from '@/lib/db/schema';
import { eq, desc, asc, sql, isNull, and, SQL, inArray } from 'drizzle-orm';
import { RoleData, CreateRoleRequest, UpdateRoleRequest, RoleStatus, RoleListOptions } from '@/lib/types/role';
import { Permission } from '@/lib/permissions/definitions';

export class RoleDbService {
  // Helper method to get permissions for a role
  private async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePerms = await db
      .select({ permissionKey: permissions.key })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return rolePerms.map(rp => rp.permissionKey as Permission);
  }

  // Helper method to get roles with their permissions
  private async getRolesWithPermissions(roleIds?: string[]): Promise<RoleData[]> {
    // Get roles
    let roleQuery = db.select().from(roles).where(isNull(roles.deletedAt));

    if (roleIds && roleIds.length > 0) {
      roleQuery = db.select().from(roles).where(and(
        isNull(roles.deletedAt),
        inArray(roles.id, roleIds)
      ));
    }

    const rolesResult = await roleQuery;

    // Get permissions for all roles in a single query
    const allRoleIds = roleIds && roleIds.length > 0 ? roleIds : rolesResult.map(r => r.id);
    let rolePermissionsResult: { roleId: string; permissionKey: string }[] = [];

    if (allRoleIds.length > 0) {
      rolePermissionsResult = await db
        .select({
          roleId: rolePermissions.roleId,
          permissionKey: permissions.key
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(inArray(rolePermissions.roleId, allRoleIds));
    }

    // Group permissions by role
    const permissionsByRole = rolePermissionsResult.reduce((acc, rp) => {
      if (!acc[rp.roleId]) {
        acc[rp.roleId] = [];
      }
      acc[rp.roleId].push(rp.permissionKey as Permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    // Map roles with their permissions
    return rolesResult.map(role => this.mapDbToRoleData(role, permissionsByRole[role.id] || []));
  }

  // Helper method to update role permissions
  private async updateRolePermissions(roleId: string, newPermissions: Permission[]): Promise<void> {
    await db.transaction(async (tx) => {
      if (newPermissions.length === 0) {
        await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
        return;
      }

      const permissionRecords = await tx
        .select({ id: permissions.id, key: permissions.key })
        .from(permissions)
        .where(inArray(permissions.key, newPermissions));

      const missingKeys = newPermissions.filter(
        key => !permissionRecords.some(record => record.key === key),
      );

      if (missingKeys.length > 0) {
        throw new Error(`Unknown permission keys: ${missingKeys.join(', ')}`);
      }

      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

      await tx.insert(rolePermissions).values(
        permissionRecords.map(perm => ({
          roleId,
          permissionId: perm.id,
        })),
      );
    });
  }

  async readRoles(): Promise<RoleData[]> {
    try {
      return await this.getRolesWithPermissions();
    } catch (error) {
      console.error('Error reading roles from database:', error);
      throw new Error('Failed to retrieve roles');
    }
  }

  async findById(id: string): Promise<RoleData | null> {
    try {
      const rolesWithPermissions = await this.getRolesWithPermissions([id]);
      return rolesWithPermissions.length > 0 ? rolesWithPermissions[0] : null;
    } catch (error) {
      console.error('Error finding role by ID:', error);
      throw new Error('Failed to retrieve role');
    }
  }

  async createRole(data: CreateRoleRequest): Promise<RoleData> {
    try {
      // Check for duplicate ID
      if (await this.exists(data.id)) {
        throw new Error(`Role with ID '${data.id}' already exists`);
      }

      const roleData = {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status || 'active',
        isAdmin: data.isAdmin || false,
        created_by: 'system',
      };

      // Insert role
      const result = await db.insert(roles).values(roleData).returning();
      const newRole = result[0];

      // Insert permissions if provided
      if (data.permissions && data.permissions.length > 0) {
        await this.updateRolePermissions(newRole.id, data.permissions);
      }

      const createdPermissions = await this.getRolePermissions(newRole.id);
      return this.mapDbToRoleData(newRole, createdPermissions);
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleData> {
    try {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;

      let roleRecord;

      // Only update the roles table if there are actual role fields to update
      if (Object.keys(updateData).length > 0) {
        const result = await db.update(roles)
          .set(updateData)
          .where(eq(roles.id, id))
          .returning();

        if (result.length === 0) {
          throw new Error(`Role with ID '${id}' not found`);
        }
        roleRecord = result[0];
      } else {
        // If no role fields to update, just get the existing role
        const existingRoles = await db.select().from(roles).where(eq(roles.id, id));
        if (existingRoles.length === 0) {
          throw new Error(`Role with ID '${id}' not found`);
        }
        roleRecord = existingRoles[0];
      }

      // Update permissions if provided
      if (data.permissions !== undefined) {
        await this.updateRolePermissions(id, data.permissions);
      }

      // Get updated permissions to return complete role data
      const updatedPermissions = await this.getRolePermissions(id);
      return this.mapDbToRoleData(roleRecord, updatedPermissions);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      await db.update(roles)
        .set({ deletedAt: new Date() })
        .where(eq(roles.id, id));
    } catch (error) {
      console.error('Error deleting role:', error);
      throw new Error('Failed to delete role');
    }
  }

  async hardDeleteRole(id: string): Promise<void> {
    try {
      await db.delete(roles).where(eq(roles.id, id));
    } catch (error) {
      console.error('Error hard deleting role:', error);
      throw new Error('Failed to hard delete role');
    }
  }

  async findRoles(options: RoleListOptions = {}): Promise<{
    roles: RoleData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, status, sortBy = 'name', sortOrder = 'asc' } = options;

      // Build the base query with conditional filters
      const filters: SQL[] = [isNull(roles.deletedAt)]; // Always exclude deleted roles
      if (status) {
        filters.push(eq(roles.status, status));
      }

      // Get total count with same filters
      const countQuery = db.select({ count: sql<number>`count(*)` }).from(roles).where(and(...filters));
      const countResult = await countQuery;
      const total = countResult[0]?.count ?? 0;

      // Apply sorting and pagination
      const sortFieldMap = {
        name: roles.name,
        id: roles.id,
        created_at: roles.createdAt
      };
      const sortField = sortFieldMap[sortBy] || roles.name;
      const orderFn = sortOrder === 'desc' ? desc : asc;

      const query = db.select().from(roles).where(and(...filters));

      const result = await query
        .orderBy(orderFn(sortField))
        .limit(limit)
        .offset((page - 1) * limit);

      // Get permissions for the returned roles
      const roleIds = result.map(role => role.id);
      let rolePermissionsResult: { roleId: string; permissionKey: string }[] = [];

      if (roleIds.length > 0) {
        rolePermissionsResult = await db
          .select({
            roleId: rolePermissions.roleId,
            permissionKey: permissions.key
          })
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(inArray(rolePermissions.roleId, roleIds));
      }

      // Group permissions by role
      const permissionsByRole = rolePermissionsResult.reduce((acc, rp) => {
        if (!acc[rp.roleId]) {
          acc[rp.roleId] = [];
        }
        acc[rp.roleId].push(rp.permissionKey as Permission);
        return acc;
      }, {} as Record<string, Permission[]>);

      return {
        roles: result.map(role => this.mapDbToRoleData(role, permissionsByRole[role.id] || [])),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error finding roles:', error);

      // Provide more specific error messages for debugging
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string; message?: string };
        if (dbError.code === 'CONNECT_TIMEOUT') {
          throw new Error('Database connection timeout - please check your database connection');
        } else if (dbError.code === 'ECONNREFUSED') {
          throw new Error('Database connection refused - please ensure PostgreSQL is running');
        }
      }

      throw new Error(`Failed to retrieve roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: string, options: { includeDeleted?: boolean } = {}): Promise<boolean> {
    try {
      const conditions: SQL[] = [eq(roles.id, id)];
      if (!options.includeDeleted) {
        conditions.push(isNull(roles.deletedAt));
      }

      const result = await db.select().from(roles).where(and(...conditions));
      return result.length > 0;
    } catch (error) {
      console.error('Error checking role existence:', error);
      return false;
    }
  }

  private mapDbToRoleData(dbRole: typeof roles.$inferSelect, rolePermissions: Permission[] = []): RoleData {
    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || '',
      status: (dbRole.status as RoleStatus) || 'active',
      isAdmin: dbRole.isAdmin || false,
      permissions: rolePermissions,
      created_at: dbRole.createdAt.toISOString(),
      updated_at: dbRole.updatedAt.toISOString(),
      created_by: dbRole.created_by || 'system',
    };
  }
} 