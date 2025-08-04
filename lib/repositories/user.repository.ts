import { UserGitService } from '@/lib/services/user-git.service';
import { 
  UserData, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserListOptions,
  UserListResponse,
  UserResponse,
  userValidationSchema,
  updateUserValidationSchema
} from '@/lib/types/user';

export class UserRepository {
  private userGitService: UserGitService;

  constructor() {
    this.userGitService = new UserGitService();
  }

  /**
   * Get all users with filtering and pagination
   */
  async findAll(options: UserListOptions = {}): Promise<UserListResponse> {
    try {
      const result = await this.userGitService.findUsers(options);
      return {
        users: result.users,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    } catch (error) {
      console.error('Error finding users:', error);
      return {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }

  /**
   * Get a single user by ID
   */
  async findById(id: string): Promise<UserData | null> {
    try {
      return await this.userGitService.readUser(id);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserRequest, createdBy: string): Promise<UserData> {
    try {
      // Validate input data
      const validatedData = userValidationSchema.parse(data);

      // Check if username already exists
      const usernameExists = await this.userGitService.usernameExists(validatedData.username);
      if (usernameExists) {
        throw new Error('Username already exists');
      }

      // Check if email already exists
      const emailExists = await this.userGitService.emailExists(validatedData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      // Create user
      const user = await this.userGitService.createUser(validatedData, createdBy);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update an existing user
   */
  async update(id: string, data: UpdateUserRequest): Promise<UserData> {
    try {
      // Validate input data
      const validatedData = updateUserValidationSchema.parse(data);

      // Check if user exists
      const existingUser = await this.userGitService.readUser(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Check username uniqueness if username is being updated
      if (validatedData.username && validatedData.username !== existingUser.username) {
        const usernameExists = await this.userGitService.usernameExists(validatedData.username, id);
        if (usernameExists) {
          throw new Error('Username already exists');
        }
      }

      // Check email uniqueness if email is being updated
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const emailExists = await this.userGitService.emailExists(validatedData.email, id);
        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      // Update user
      const updatedUser = await this.userGitService.updateUser(id, validatedData);
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await this.userGitService.readUser(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Prevent deletion of the last super admin
      if (existingUser.role === 'super-admin') {
        const allUsers = await this.userGitService.readUsers();
        const superAdmins = allUsers.filter(user => user.role === 'super-admin' && user.status === 'active');
        if (superAdmins.length <= 1) {
          throw new Error('Cannot delete the last super admin');
        }
      }

      await this.userGitService.deleteUser(id);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      return await this.userGitService.getUserStats();
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      return await this.userGitService.usernameExists(username, excludeId);
    } catch (error) {
      console.error('Error checking username existence:', error);
      return false;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      return await this.userGitService.emailExists(email, excludeId);
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  /**
   * Get all users (for dropdowns, etc.)
   */
  async getAllUsers(): Promise<UserData[]> {
    try {
      return await this.userGitService.readUsers();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
} 