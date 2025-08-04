import { useState, useCallback } from 'react';
import { 
  UserData, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserListOptions,
  UserListResponse 
} from '@/lib/types/user';

// API base URL
const API_BASE = '/api/admin/users';

// Custom hook for user management
export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get users with filtering and pagination
  const getUsers = useCallback(async (options: UserListOptions = {}): Promise<UserListResponse> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.search) params.append('search', options.search);
      if (options.role) params.append('role', options.role);
      if (options.status) params.append('status', options.status);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.includeInactive) params.append('includeInactive', 'true');

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      return {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single user by ID
  const getUser = useCallback(async (id: string): Promise<UserData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }

      const data = await response.json();
      return data.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new user
  const createUser = useCallback(async (userData: CreateUserRequest): Promise<UserData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      return data.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing user
  const updateUser = useCallback(async (id: string, userData: UpdateUserRequest): Promise<UserData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      return data.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a user
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user statistics
  const getUserStats = useCallback(async (): Promise<{
    total: number;
    active: number;
    inactive: number;
  } | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/stats`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user statistics');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user statistics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check username availability
  const checkUsername = useCallback(async (username: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, excludeId }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.available;
    } catch (err) {
      return false;
    }
  }, []);

  // Check email availability
  const checkEmail = useCallback(async (email: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, excludeId }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.available;
    } catch (err) {
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats,
    checkUsername,
    checkEmail,
    clearError,
  };
} 