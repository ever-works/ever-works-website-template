import { db } from '@/lib/db/drizzle';
import { users, clientProfiles } from '@/lib/db/schema';
import { eq, desc, asc, and, sql, isNull, type SQL } from 'drizzle-orm';
import { AuthUserData, CreateUserRequest, UpdateUserRequest, UserListOptions } from '@/lib/types/user';
import { hash } from 'bcryptjs';

export class UserDbService {
  async readUsers(): Promise<AuthUserData[]> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(isNull(users.deletedAt));
      return result.map(this.mapDbToAuthUserData);
    } catch (error) {
      console.error('Error reading users from database:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<AuthUserData | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)));
      return result.length > 0 ? this.mapDbToAuthUserData(result[0]) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  async createUser(data: Pick<CreateUserRequest, 'email' | 'password'>): Promise<AuthUserData> {
    try {
      // Hash the password
      const passwordHash = await hash(data.password, 10);

      const userData = {
        email: data.email.trim().toLowerCase(),
        passwordHash,
      } as const;

      const result = await db.insert(users).values(userData).returning();
      return this.mapDbToAuthUserData(result[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const conditions: SQL[] = [
        sql`lower(${users.email}) = lower(${email})`,
        isNull(users.deletedAt)
      ];
      if (excludeId) {
        conditions.push(sql`${users.id} != ${excludeId}`);
      }
      const res = await db
        .select({ id: users.id })
        .from(users)
        .where(and(...conditions))
        .limit(1);
      return res.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email availability');
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<AuthUserData> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.email !== undefined) updateData.email = data.email;

      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error(`User with ID '${id}' not found`);
      }

      return this.mapDbToAuthUserData(result[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await db.update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async findUsers(options: UserListOptions = {}): Promise<{
    users: AuthUserData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'email', sortOrder = 'asc' } = options as any;
      
      let query = db.select().from(users);
      const conditions: SQL[] = [];
      conditions.push(isNull(users.deletedAt));

      if (search) {
        // Filter by email only in minimized schema
        conditions.push(sql`${users.email} ILIKE ${`%${search.replace(/\\/g, "\\\\").replace(/[%_]/g, "\\$&")}%`}`);
      }

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
      const sortFieldMap: Record<string, any> = {
        email: users.email,
        created_at: users.createdAt
      };
      const sortField = sortFieldMap[sortBy] || users.email;
      const orderFn = sortOrder === 'desc' ? desc : asc;
      const result = await query
        .orderBy(orderFn(sortField))
        .limit(limit)
        .offset((page - 1) * limit);
      
      return {
        users: result.map(this.mapDbToAuthUserData),
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

  /**
   * Get user statistics from clientProfiles
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const result = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`count(*) filter (where ${clientProfiles.status} = 'active')`,
          inactive: sql<number>`count(*) filter (where ${clientProfiles.status} != 'active')`
        })
        .from(clientProfiles);

      return {
        total: Number(result[0].total),
        active: Number(result[0].active),
        inactive: Number(result[0].inactive)
      };
    } catch (error) {
      console.error('Error getting user stats from clientProfiles:', error);
      throw new Error('Failed to retrieve user statistics');
    }
  }

  /**
   * Check if username exists in clientProfiles
   */
  async clientProfileUsernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      let query = db
        .select({ id: clientProfiles.id })
        .from(clientProfiles)
        .where(eq(clientProfiles.username, username));

      if (excludeId) {
        query = query.where(and(
          eq(clientProfiles.username, username),
          sql`${clientProfiles.id} != ${excludeId}`
        ));
      }

      const result = await query;
      return result.length > 0;
    } catch (error) {
      console.error('Error checking username existence in clientProfiles:', error);
      throw new Error('Failed to check username availability');
    }
  }

  private mapDbToAuthUserData(dbUser: typeof users.$inferSelect): AuthUserData {
    return {
      id: dbUser.id,
      email: dbUser.email || '',
      created_at: dbUser.createdAt.toISOString(),
      updated_at: dbUser.updatedAt.toISOString(),
    };
  }
} 