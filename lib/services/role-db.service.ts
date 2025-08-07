import { db } from '@/lib/db/drizzle';
import { roles } from '@/lib/db/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { RoleData, CreateRoleRequest, UpdateRoleRequest, RoleStatus, RoleListOptions } from '@/lib/types/role';
import { Permission } from '@/lib/permissions/definitions';

export class RoleDbService {
  async readRoles(): Promise<RoleData[]> {
    try {
      const result = await db.select().from(roles);
      return result.map(this.mapDbToRoleData);
    } catch (error) {
      console.error('Error reading roles from database:', error);
      throw new Error('Failed to retrieve roles');
    }
  }

  async findById(id: string): Promise<RoleData | null> {
    try {
      const result = await db.select().from(roles).where(eq(roles.id, id));
      return result.length > 0 ? this.mapDbToRoleData(result[0]) : null;
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
        permissions: JSON.stringify(data.permissions),
        created_by: 'system',
      };

      const result = await db.insert(roles).values(roleData).returning();
      return this.mapDbToRoleData(result[0]);
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
      if (data.permissions !== undefined) updateData.permissions = JSON.stringify(data.permissions);

      const result = await db.update(roles)
        .set(updateData)
        .where(eq(roles.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error(`Role with ID '${id}' not found`);
      }

      return this.mapDbToRoleData(result[0]);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      await db.update(roles)
        .set({ status: 'inactive' })
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
      
      let query = db.select().from(roles);
      
      // Apply filters
      if (status) {
        query = query.where(eq(roles.status, status));
      }
      
      // Get total count
      const countResult = await db.select({ count: sql`count(*)` }).from(roles);
      const total = Number(countResult[0].count);
      
      // Apply sorting and pagination
      let result;
      if (sortBy === 'name') {
        result = await query
          .orderBy(sortOrder === 'desc' ? desc(roles.name) : asc(roles.name))
          .limit(limit)
          .offset((page - 1) * limit);
      } else if (sortBy === 'id') {
        result = await query
          .orderBy(sortOrder === 'desc' ? desc(roles.id) : asc(roles.id))
          .limit(limit)
          .offset((page - 1) * limit);
      } else if (sortBy === 'created_at') {
        result = await query
          .orderBy(sortOrder === 'desc' ? desc(roles.createdAt) : asc(roles.createdAt))
          .limit(limit)
          .offset((page - 1) * limit);
      } else {
        // Default to name sorting
        result = await query
          .orderBy(asc(roles.name))
          .limit(limit)
          .offset((page - 1) * limit);
      }
      
      return {
        roles: result.map(this.mapDbToRoleData),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error finding roles:', error);
      throw new Error('Failed to retrieve roles');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await db.select().from(roles).where(eq(roles.id, id));
      return result.length > 0;
    } catch (error) {
      console.error('Error checking role existence:', error);
      return false;
    }
  }

  private mapDbToRoleData(dbRole: typeof roles.$inferSelect): RoleData {
    return {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || '',
      status: (dbRole.status as RoleStatus) || 'active',
      permissions: JSON.parse(dbRole.permissions) as Permission[],
      created_at: dbRole.createdAt.toISOString(),
      updated_at: dbRole.updatedAt.toISOString(),
      created_by: dbRole.created_by || 'system',
    };
  }
} 