'use client';

import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/use-users';
import { UserData, CreateUserRequest, UpdateUserRequest } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface UserFormProps {
  user?: UserData;
  onSuccess: () => void;
}

export default function UserForm({ user, onSuccess }: UserFormProps) {
  const { createUser, updateUser, checkUsername, checkEmail, loading } = useUsers();
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const isEditing = !!user;

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
          onSuccess();
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
          onSuccess();
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
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
              {formData.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <Input 
            placeholder="John Doe" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input 
            placeholder="Software Engineer" 
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super-admin">Super Admin</option>
          </select>
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-medium mb-2">Status *</label>
            <select 
              value={formData.status} 
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
} 