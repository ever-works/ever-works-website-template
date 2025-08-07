import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, like, desc, asc, and, or, sql } from 'drizzle-orm';
import { UserData, CreateUserRequest, UpdateUserRequest, UserListOptions, UserStatus } from '@/lib/types/user';
import { generateUserId } from '@/lib/types/user';

export class UserDbService {
  async readUsers(): Promise<UserData[]> {
    try {
      const result = await db.select().from(users);
      return result.map(this.mapDbToUserData);
    } catch (error) {
      console.error('Error reading users from database:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<UserData | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result.length > 0 ? this.mapDbToUserData(result[0]) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  async createUser(data: CreateUserRequest, createdBy: string): Promise<UserData> {
    try {
      // Check for duplicate username
      if (await this.usernameExists(data.username)) {
        throw new Error(`Username '${data.username}' already exists`);
      }

      // Check for duplicate email
      if (await this.emailExists(data.email)) {
        throw new Error(`Email '${data.email}' already exists`);
      }

      const userData = {
        id: generateUserId(),
        username: data.username,
        email: data.email,
        name: data.name,
        title: data.title,
        avatar: data.avatar,
        role_id: data.role,
        status: 'active',
        created_by: createdBy,
      };

      const result = await db.insert(users).values(userData).returning();
      return this.mapDbToUserData(result[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserData> {
    try {
      // Validate uniqueness for username/email if being updated
      if (data.username !== undefined && await this.usernameExists(data.username, id)) {
        throw new Error(`Username '${data.username}' already exists`);
      }
      if (data.email !== undefined && await this.emailExists(data.email, id)) {
        throw new Error(`Email '${data.email}' already exists`);
      }

      const updateData: Record<string, unknown> = {};
      
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.role !== undefined) updateData.role_id = data.role;
      if (data.status !== undefined) updateData.status = data.status;

      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error(`User with ID '${id}' not found`);
      }

      return this.mapDbToUserData(result[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await db.update(users)
        .set({ status: 'inactive' })
        .where(eq(users.id, id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async findUsers(options: UserListOptions = {}): Promise<{
    users: UserData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, status, search, role, sortBy = 'name', sortOrder = 'asc' } = options;
      
      let query = db.select().from(users);
      
      // Apply filters
      const conditions = [];
      if (status) conditions.push(eq(users.status, status));
      if (search) {
        // Escape SQL wildcards in search term
        const escapedSearch = search.replace(/[%_]/g, '\\$&');
        conditions.push(or(
          like(users.name, `%${escapedSearch}%`),
          like(users.username, `%${escapedSearch}%`),
          like(users.email, `%${escapedSearch}%`)
        ));
      }
      if (role) conditions.push(eq(users.role_id, role));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Get total count with same filters
      let countQuery = db.select({ count: sql`count(*)` }).from(users);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      const countResult = await countQuery;
      const total = Number(countResult[0].count);
      
      // Apply sorting and pagination
      const sortFieldMap = {
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role_id,
        created_at: users.createdAt
      };
      const sortField = sortFieldMap[sortBy] || users.name;
      const orderFn = sortOrder === 'desc' ? desc : asc;
      const result = await query
        .orderBy(orderFn(sortField))
        .limit(limit)
        .offset((page - 1) * limit);
      
      return {
        users: result.map(this.mapDbToUserData),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error finding users:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      let query = db.select().from(users).where(eq(users.username, username));
      if (excludeId) {
        query = query.where(sql`id != ${excludeId}`);
      }
      const result = await query;
      return result.length > 0;
    } catch (error) {
      console.error('Error checking username existence:', error);
      throw new Error('Failed to check username availability');
    }
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      let query = db.select().from(users).where(eq(users.email, email));
      if (excludeId) {
        query = query.where(sql`id != ${excludeId}`);
      }
      const result = await query;
      return result.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email availability');
    }
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const result = await db.select({
        total: sql`count(*)`,
        active: sql`count(*) filter (where status = 'active')`,
        inactive: sql`count(*) filter (where status = 'inactive')`,
      }).from(users);

      return {
        total: Number(result[0].total),
        active: Number(result[0].active),
        inactive: Number(result[0].inactive),
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to retrieve user statistics');
    }
  }

  private mapDbToUserData(dbUser: typeof users.$inferSelect): UserData {
    return {
      id: dbUser.id,
      username: dbUser.username || '',
      email: dbUser.email || '',
      name: dbUser.name || '',
      title: dbUser.title || undefined,
      avatar: dbUser.avatar || undefined,
      role: dbUser.role_id || '',
      status: (dbUser.status as UserStatus) || 'active',
      created_at: dbUser.createdAt.toISOString(),
      updated_at: dbUser.updatedAt.toISOString(),
      created_by: dbUser.created_by || 'system',
    };
  }
} 