'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleData, CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role';
import { PERMISSIONS, Permission } from '@/lib/permissions/definitions';

interface RoleFormProps {
  role?: RoleData;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
  onCancel: () => void;
}

export function RoleForm({ role, onSubmit, onCancel }: RoleFormProps) {
  const [formData, setFormData] = useState<CreateRoleRequest>({
    id: '',
    name: '',
    description: '',
    isActive: true,
    permissions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role) {
      setFormData({
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        permissions: role.permissions,
      });
    }
  }, [role]);

  const handleInputChange = (field: keyof CreateRoleRequest, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePermissionToggle = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSelectAll = (resource: keyof typeof PERMISSIONS) => {
    const resourcePermissions = Object.values(PERMISSIONS[resource]) as Permission[];
    setFormData(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...resourcePermissions])],
    }));
  };

  const handleClearAll = (resource: keyof typeof PERMISSIONS) => {
    const resourcePermissions = Object.values(PERMISSIONS[resource]) as Permission[];
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => !resourcePermissions.includes(p)),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) {
      newErrors.id = 'Role ID is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.id)) {
      newErrors.id = 'Role ID can only contain lowercase letters, numbers, and hyphens';
    } else if (formData.id.length < 3) {
      newErrors.id = 'Role ID must be at least 3 characters';
    } else if (formData.id.length > 50) {
      newErrors.id = 'Role ID must be at most 50 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Role name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Role name must be at most 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Role description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Role description must be at most 500 characters';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (role) {
      // Update existing role
      const updateData: UpdateRoleRequest = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        permissions: formData.permissions,
      };
      onSubmit(updateData);
    } else {
      // Create new role
      onSubmit(formData);
    }
  };

  const getResourceDisplayName = (resource: string): string => {
    const displayNames: Record<string, string> = {
      items: 'Items',
      categories: 'Categories',
      tags: 'Tags',
      roles: 'Roles',
      users: 'Users',
      analytics: 'Analytics',
      system: 'System',
    };
    return displayNames[resource] || resource;
  };

  const getActionDisplayName = (action: string): string => {
    const displayNames: Record<string, string> = {
      read: 'Read',
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      review: 'Review',
      approve: 'Approve',
      reject: 'Reject',
      assignRoles: 'Assign Roles',
      export: 'Export',
      settings: 'Settings',
      backup: 'Backup',
      logs: 'Logs',
    };
    return displayNames[action] || action;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {role ? 'Edit Role' : 'Create Role'}
              </h2>
              <p className="text-muted-foreground">
                {role ? 'Update role details and permissions' : 'Create a new role with specific permissions'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Define the role&apos;s basic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">Role ID</Label>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => handleInputChange('id', e.target.value)}
                      placeholder="e.g., content-manager"
                      disabled={!!role} // Can't change ID when editing
                    />
                    {errors.id && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.id}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Content Manager"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this role can do..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Select the permissions this role should have
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errors.permissions && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errors.permissions}</p>
                )}
                
                <div className="space-y-6">
                  {Object.entries(PERMISSIONS).map(([resource, permissions]) => (
                    <div key={resource} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">
                          {getResourceDisplayName(resource)}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAll(resource as keyof typeof PERMISSIONS)}
                          >
                            Select All
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleClearAll(resource as keyof typeof PERMISSIONS)}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(permissions).map(([action, permission]) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={permission}
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionToggle(permission)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor={permission} className="text-sm font-normal">
                              {getActionDisplayName(action)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {role ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 