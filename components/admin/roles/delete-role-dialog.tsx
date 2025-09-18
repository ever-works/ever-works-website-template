'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { AlertTriangle, Trash2, Shield } from 'lucide-react';
import { RoleData } from '@/hooks/use-admin-roles';
import { clsx } from 'clsx';

interface DeleteRoleDialogProps {
  role: RoleData;
  isOpen: boolean;
  onConfirm: (hardDelete: boolean) => void;
  onCancel: () => void;
}

export function DeleteRoleDialog({ role, isOpen, onConfirm, onCancel }: DeleteRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(false); // Always soft delete
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-60"
        onClick={handleCancel}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Deactivate Role</h2>
          </div>
          {!isLoading && (
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Role Info */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {role.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {role.description}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>ID: {role.id}</span>
                <span>{role.permissions?.length || 0} permissions</span>
                <span className={clsx(
                  'px-2 py-1 rounded-full',
                  role.isAdmin
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                )}>
                  {role.isAdmin ? 'Admin Role' : 'Client Role'}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Deactivate Role</p>
                <p className="mt-1">
                  This role will be marked as inactive and cannot be assigned to new users. Users currently assigned to this role will retain their permissions until reassigned. The role can be reactivated later if needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            variant="bordered"
            onPress={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleConfirm}
            isLoading={isLoading}
            startContent={!isLoading && <Trash2 size={16} />}
            className={clsx(
              'bg-gradient-to-r from-orange-500 to-orange-600',
              'hover:from-orange-600 hover:to-orange-700',
              'shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40',
              'transition-all duration-300 text-white font-medium'
            )}
          >
            {isLoading ? 'Deactivating...' : 'Deactivate Role'}
          </Button>
        </div>
      </div>
    </div>
  );
}