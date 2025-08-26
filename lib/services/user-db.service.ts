import { db } from '@/lib/db/drizzle';
import { users, clientProfiles } from '@/lib/db/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { UserData, CreateUserRequest, UpdateUserRequest, UserListOptions, UserStatus } from '@/lib/types/user';
import { generateUserId } from '@/lib/types/user';
import { hash } from 'bcryptjs';

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

  async createUser(data: CreateUserRequest): Promise<UserData> {
    try {
      // Hash the password
      const passwordHash = await hash(data.password, 10);

      const userData = {
        id: generateUserId(),
        email: data.email,
        passwordHash,
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
      const updateData: Record<string, unknown> = {};
      if (data.email !== undefined) updateData.email = data.email;

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
        .set({ deletedAt: new Date() })
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
      const { page = 1, limit = 10, search, sortBy = 'email', sortOrder = 'asc' } = options as any;
      
      let query = db.select().from(users);
      const conditions = [] as any[];

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

  private mapDbToUserData(dbUser: typeof users.$inferSelect): UserData {
    return {
      id: dbUser.id,
      username: '',
      email: dbUser.email || '',
      name: '',
      title: undefined,
      avatar: undefined,
      role: '',
      status: 'active' as UserStatus,
      created_at: dbUser.createdAt.toISOString(),
      updated_at: dbUser.updatedAt.toISOString(),
      created_by: 'system',
    };
  }
} 