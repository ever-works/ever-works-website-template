import * as yaml from 'yaml';
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { join } from 'path';
import { 
  UserData, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserListOptions,
  generateUserId,
  formatDateForYaml
} from '@/lib/types/user';

export class UserGitService {
  private readonly usersDir: string;

  constructor() {
    this.usersDir = join(process.cwd(), '.content', 'users');
  }

  /**
   * Read all users from YAML files
   */
  async readUsers(): Promise<UserData[]> {
    try {
      const files = await readdir(this.usersDir);
      const userFiles = files.filter(file => file.endsWith('.yml'));
      
      const users: UserData[] = [];
      
      for (const file of userFiles) {
        try {
          const filePath = join(this.usersDir, file);
          const content = await readFile(filePath, 'utf-8');
          const userData = yaml.parse(content) as UserData;
          
          // Validate required fields
          if (userData.id && userData.username && userData.email && userData.name && userData.role) {
            users.push(userData);
          } else {
            console.warn(`⚠️ Invalid user data in ${file}: missing required fields`);
          }
        } catch (error) {
          console.error(`❌ Error reading user file ${file}:`, error);
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error reading users directory:', error);
      return [];
    }
  }

  /**
   * Read a single user by ID
   */
  async readUser(id: string): Promise<UserData | null> {
    try {
      const filePath = join(this.usersDir, `${id}.yml`);
      const content = await readFile(filePath, 'utf-8');
      return yaml.parse(content) as UserData;
    } catch (error) {
      console.error(`❌ Error reading user file ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest, createdBy: string): Promise<UserData> {
    const id = generateUserId();
    const now = formatDateForYaml();
    
    const userData: UserData = {
      id,
      username: data.username,
      email: data.email,
      name: data.name,
      title: data.title,
      avatar: data.avatar,
      role: data.role,
      status: 'active',
      created_at: now,
      updated_at: now,
      created_by: createdBy,
    };

    const filePath = join(this.usersDir, `${id}.yml`);
    const yamlContent = yaml.stringify(userData);
    
    await writeFile(filePath, yamlContent, 'utf-8');
    
    console.log(`✅ Created user: ${userData.username} (${id})`);
    return userData;
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<UserData> {
    const existingUser = await this.readUser(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser: UserData = {
      ...existingUser,
      ...data,
      updated_at: formatDateForYaml(),
    };

    const filePath = join(this.usersDir, `${id}.yml`);
    const yamlContent = yaml.stringify(updatedUser);
    
    await writeFile(filePath, yamlContent, 'utf-8');
    
    console.log(`✅ Updated user: ${updatedUser.username} (${id})`);
    return updatedUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    const filePath = join(this.usersDir, `${id}.yml`);
    
    try {
      await unlink(filePath);
      console.log(`✅ Deleted user: ${id}`);
    } catch (error) {
      console.error(`❌ Error deleting user file ${id}:`, error);
      throw new Error(`User with ID ${id} not found`);
    }
  }

  /**
   * Find users with filtering and pagination
   */
  async findUsers(options: UserListOptions = {}): Promise<{
    users: UserData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let users = await this.readUsers();

    // Apply filters
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    if (options.role) {
      users = users.filter(user => user.role === options.role);
    }

    if (options.status) {
      users = users.filter(user => user.status === options.status);
    }

    if (!options.includeInactive) {
      users = users.filter(user => user.status === 'active');
    }

    // Apply sorting
    const sortBy = options.sortBy || 'name';
    const sortOrder = options.sortOrder || 'asc';
    
    users.sort((a, b) => {
      let aValue: string | number = a[sortBy] || '';
      let bValue: string | number = b[sortBy] || '';
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    const users = await this.readUsers();
    return users.some(user => 
      user.username.toLowerCase() === username.toLowerCase() && 
      user.id !== excludeId
    );
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const users = await this.readUsers();
    return users.some(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.id !== excludeId
    );
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const users = await this.readUsers();
    
    return {
      total: users.length,
      active: users.filter(user => user.status === 'active').length,
      inactive: users.filter(user => user.status === 'inactive').length,
    };
  }
} 