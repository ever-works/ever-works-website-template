'use client';

import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/use-users';
import { useRoles } from '@/hooks/use-roles';
import { UserData, CreateUserRequest, UpdateUserRequest } from '@/lib/types/user';
import { Button, Input } from '@heroui/react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface UserFormProps {
  user?: UserData;
  onSuccess: (data: CreateUserRequest | UpdateUserRequest) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export default function UserForm({ user, onSuccess, isSubmitting = false, onCancel }: UserFormProps) {
  // Extract long className strings into constants for better maintainability
  const selectClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
  
  const { createUser, updateUser, checkUsername, checkEmail } = useUsers();
  const { roles, loading: rolesLoading, getRoles } = useRoles();
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const isEditing = !!user;

  // Load roles on component mount
  useEffect(() => {
    getRoles();
  }, [getRoles]);

  // Form state
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    name: user?.name || '',
    title: user?.title || '',
    avatar: user?.avatar || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
    password: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check username availability
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        const available = await checkUsername(formData.username, user?.id);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, user?.id, checkUsername]);

  // Check email availability
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!formData.email || !formData.email.includes('@')) {
        setEmailAvailable(null);
        return;
      }

      setCheckingEmail(true);
      try {
        const available = await checkEmail(formData.email, user?.id);
        setEmailAvailable(available);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, user?.id, checkEmail]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }
    
    try {
      if (isEditing) {
        const updateData: UpdateUserRequest = {
          username: formData.username,
          email: formData.email,
          name: formData.name,
          title: formData.title,
          avatar: formData.avatar,
          role: formData.role,
          status: formData.status,
        };

        const updatedUser = await updateUser(user.id, updateData);
        if (updatedUser) {
          onSuccess(updateData);
        }
      } else {
        const createData: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          name: formData.name,
          title: formData.title,
          avatar: formData.avatar,
          role: formData.role,
          password: formData.password,
        };

        const newUser = await createUser(createData);
        if (newUser) {
          onSuccess(createData);
        }
      }
    } catch {
      toast.error('Failed to save user');
    }
  };

  const getUsernameStatus = () => {
    if (checkingUsername) return 'checking';
    if (usernameAvailable === null) return 'neutral';
    return usernameAvailable ? 'available' : 'unavailable';
  };

  const getEmailStatus = () => {
    if (checkingEmail) return 'checking';
    if (emailAvailable === null) return 'neutral';
    return emailAvailable ? 'available' : 'unavailable';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isEditing ? 'Update user information' : 'Add a new user to the platform'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center text-white text-lg font-semibold">
            {formData.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Avatar URL</label>
            <Input
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              className="w-full"
              variant="bordered"
            />
          </div>
        </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <Input 
            placeholder="John Doe" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            variant="bordered"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input 
            placeholder="Software Engineer" 
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            variant="bordered"
          />
        </div>
      </div>

      {/* Username and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username *</label>
          <div className="relative">
            <Input 
              placeholder="johndoe" 
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={getUsernameStatus() === 'unavailable' ? 'border-red-500' : ''}
              required
              variant="bordered"
            />
            {checkingUsername && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {getUsernameStatus() === 'available' && (
            <p className="text-sm text-green-600 mt-1">Username is available</p>
          )}
          {getUsernameStatus() === 'unavailable' && (
            <p className="text-sm text-red-600 mt-1">Username is already taken</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <div className="relative">
            <Input 
              type="email" 
              placeholder="john@example.com" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={getEmailStatus() === 'unavailable' ? 'border-red-500' : ''}
              required
              variant="bordered"
            />
            {checkingEmail && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {getEmailStatus() === 'available' && (
            <p className="text-sm text-green-600 mt-1">Email is available</p>
          )}
          {getEmailStatus() === 'unavailable' && (
            <p className="text-sm text-red-600 mt-1">Email is already taken</p>
          )}
        </div>
      </div>

      {/* Password (only for new users) */}
      {!isEditing && (
        <div>
          <label className="block text-sm font-medium mb-2">Password *</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              variant="bordered"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Role and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Role *</label>
          <select 
            value={formData.role} 
            onChange={(e) => handleInputChange('role', e.target.value)}
            className={selectClasses}
            disabled={rolesLoading}
            required
          >
            {rolesLoading ? (
              <option value="">Loading roles...</option>
            ) : (
              <>
                {roles
                  .filter(role => role.status === 'active')
                  .map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
              </>
            )}
          </select>
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-medium mb-2">Status *</label>
            <select 
              value={formData.status} 
              onChange={(e) => handleInputChange('status', e.target.value)}
              className={selectClasses}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 -mx-6 -mb-6 px-6 pb-6">
        {onCancel && (
          <Button
            variant="bordered"
            onPress={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          color="primary"
          disabled={isSubmitting}
          className="px-4 py-2"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  </div>
);
}