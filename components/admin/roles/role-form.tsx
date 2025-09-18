'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Switch } from '@heroui/react';
import { Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RoleData, CreateRoleRequest, UpdateRoleRequest } from '@/hooks/use-admin-roles';
import { clsx } from 'clsx';

interface RoleFormProps {
  role?: RoleData;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const containerClasses = clsx(
  'bg-white dark:bg-gray-900 rounded-xl shadow-xl',
  'border border-gray-200 dark:border-gray-700'
);

const headerClasses = clsx(
  'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
  'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'
);

const formClasses = 'p-6 space-y-6';

const actionsClasses = clsx(
  'flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700',
  'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900',
  '-mx-6 -mb-6 px-6 pb-6'
);

export function RoleForm({ role, onSubmit, onCancel, isLoading = false, mode }: RoleFormProps) {
  interface FormData {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    isAdmin: boolean;
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    status: 'active',
    isAdmin: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        status: role.status,
        isAdmin: role.isAdmin,
      });
    }
  }, [role]);

  const handleInputChange = (field: keyof FormData, value: string | 'active' | 'inactive' | boolean) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Role' : 'Edit Role'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {mode === 'create'
            ? 'Create a new role with specific permissions and access levels'
            : 'Update the role information and permissions'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className={formClasses}>
        {/* Role Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role Name *
          </label>
          <Input
            id="name"
            placeholder="Enter role name (e.g., Admin, Manager, User)"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            disabled={isLoading}
          />
        </div>

        {/* Role Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description *
          </label>
          <Textarea
            id="description"
            placeholder="Describe the role's purpose and responsibilities..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={clsx(
              'min-h-[100px]',
              errors.description && 'border-red-500 focus:border-red-500'
            )}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Role Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <div className="flex items-center space-x-3">
            <Switch
              isSelected={formData.status === 'active'}
              onValueChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formData.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formData.status === 'active'
              ? 'This role is active and can be assigned to users'
              : 'This role is inactive and cannot be assigned to new users'
            }
          </p>
        </div>

        {/* Admin Role */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role Type
          </label>
          <div className="flex items-center space-x-3">
            <Switch
              isSelected={formData.isAdmin}
              onValueChange={(checked) => handleInputChange('isAdmin', checked)}
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formData.isAdmin ? 'Admin Role' : 'Client Role'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formData.isAdmin
              ? 'This is an administrative role with elevated permissions'
              : 'This is a client role with standard user permissions'
            }
          </p>
        </div>

        {/* Actions */}
        <div className={actionsClasses}>
          <Button
            type="button"
            variant="bordered"
            onPress={onCancel}
            disabled={isLoading}
            startContent={<X size={16} />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            startContent={!isLoading && <Save size={16} />}
            className={clsx(
              'bg-gradient-to-r from-theme-primary to-theme-accent',
              'hover:from-theme-primary/90 hover:to-theme-accent/90',
              'shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40',
              'transition-all duration-300 text-white font-medium'
            )}
          >
            {isLoading
              ? `${mode === 'create' ? 'Creating' : 'Updating'}...`
              : `${mode === 'create' ? 'Create' : 'Update'} Role`
            }
          </Button>
        </div>
      </form>
    </div>
  );
}