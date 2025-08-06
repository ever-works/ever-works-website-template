'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Switch } from '@heroui/react';
import { Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RoleData, CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role';
import { PERMISSIONS, Permission, getPermissionsForResource } from '@/lib/permissions/definitions';

interface RoleFormProps {
  role?: RoleData;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function RoleForm({ role, onSubmit, onCancel, isLoading = false, mode }: RoleFormProps) {
  // Extract long className strings into constants for better maintainability
  const containerClasses = "bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700";
  const headerClasses = "px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900";
  const formClasses = "p-6 space-y-6";
  const actionsClasses = "flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 -mx-6 -mb-6 px-6 pb-6";

  const [formData, setFormData] = useState<CreateRoleRequest>({
    id: '',
    name: '',
    description: '',
    status: 'active',
    permissions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role) {
      setFormData({
        id: role.id,
        name: role.name,
        description: role.description,
        status: role.status,
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
    const resourcePermissions = getPermissionsForResource(resource);
    setFormData(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...resourcePermissions])],
    }));
  };

  const handleClearAll = (resource: keyof typeof PERMISSIONS) => {
    const resourcePermissions = getPermissionsForResource(resource);
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
      newErrors.permissions = 'At least one permission must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = mode === 'edit' 
      ? { ...formData } as UpdateRoleRequest
      : formData as CreateRoleRequest;

    onSubmit(submitData);
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
    };
    return displayNames[action] || action;
  };

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Role' : 'Edit Role'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {mode === 'create' ? 'Create a new role with specific permissions' : 'Update role details and permissions'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={formClasses}>
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Field */}
              <div>
                <Input
                  label="Role ID"
                  placeholder="Enter role ID (e.g., content-manager)"
                  value={formData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  errorMessage={errors.id}
                  isInvalid={!!errors.id}
                  isRequired
                  isDisabled={mode === 'edit'} // ID cannot be changed when editing
                  className="w-full"
                  description={mode === 'edit' ? "ID cannot be changed after creation" : "Use lowercase with hyphens (e.g., my-role)"}
                />
              </div>

              {/* Name Field */}
              <div>
                <Input
                  label="Role Name"
                  placeholder="Enter role name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  errorMessage={errors.name}
                  isInvalid={!!errors.name}
                  isRequired
                  maxLength={100}
                  className="w-full"
                  description="Display name for the role"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/100 characters
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div className="mt-4">
              <Textarea
                label="Description"
                placeholder="Describe what this role can do..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                errorMessage={errors.description}
                isInvalid={!!errors.description}
                isRequired
                maxLength={500}
                minRows={3}
                className="w-full"
                description="Detailed description of the role's purpose and responsibilities"
              />
            </div>

            {/* Active Status */}
            <div className="mt-4">
              <div className="flex items-center space-x-3">
                <Switch
                  isSelected={formData.status === 'active'}
                  onValueChange={(checked: boolean) => handleInputChange('status', checked ? 'active' : 'inactive')}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Role
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Inactive roles cannot be assigned to users
              </p>
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Permissions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the permissions this role should have
            </p>

            {errors.permissions && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.permissions}</p>
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(PERMISSIONS).map(([resource, permissions]) => (
                <div key={resource} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getResourceDisplayName(resource)}
                    </h4>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => handleSelectAll(resource as keyof typeof PERMISSIONS)}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => handleClearAll(resource as keyof typeof PERMISSIONS)}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(permissions).map(([action, permission]) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Switch
                          size="sm"
                          isSelected={formData.permissions.includes(permission)}
                          onValueChange={() => handlePermissionToggle(permission)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {getActionDisplayName(action)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={actionsClasses}>
          <Button
            type="button"
            variant="flat"
            onPress={onCancel}
            isDisabled={isLoading}
            startContent={<X size={16} />}
            className="px-6 py-2 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            startContent={!isLoading && <Save size={16} />}
            className="px-6 py-2 font-medium bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg"
          >
            {mode === 'create' ? 'Create Role' : 'Update Role'}
          </Button>
        </div>
      </form>
    </div>
  );
} 