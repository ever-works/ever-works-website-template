'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button, Input } from '@heroui/react';
import { Save, X, Search, Shield, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
// import { useTranslations } from 'next-intl';
import { RoleData } from '@/hooks/use-admin-roles';
import { Permission } from '@/lib/permissions/definitions';
import { PERMISSION_GROUPS } from '@/lib/permissions/groups';
import {
  createPermissionState,
  getSelectedPermissions,
  calculatePermissionChanges,
  arePermissionsEqual,
  filterPermissions,
  PermissionState
} from '@/lib/permissions/utils';
import { PermissionGroupComponent } from './permission-group';

interface RolePermissionsModalProps {
  role: RoleData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleId: string, permissions: Permission[]) => Promise<boolean>;
  isLoading?: boolean;
}

const modalOverlayClasses = clsx(
  'fixed inset-0 z-[9999] flex items-center justify-center',
  'p-4 overflow-y-auto'
);

const modalBackdropClasses = clsx(
  'fixed inset-0 bg-black bg-opacity-60'
);

const modalContainerClasses = clsx(
  'relative bg-white dark:bg-gray-900 rounded-lg shadow-xl',
  'w-full max-w-4xl my-8 mx-auto',
  'max-h-[calc(100vh-4rem)] overflow-hidden',
  'flex flex-col'
);

const modalHeaderClasses = clsx(
  'flex items-center justify-between p-6',
  'border-b border-gray-200 dark:border-gray-700',
  'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'
);

const modalTitleClasses = clsx(
  'flex items-center space-x-3'
);

const modalBodyClasses = clsx(
  'flex-1 overflow-y-auto min-h-0'
);

const searchSectionClasses = clsx(
  'p-6 border-b border-gray-200 dark:border-gray-700',
  'bg-gray-50/50 dark:bg-gray-800/50'
);

const permissionsSectionClasses = clsx(
  'p-6 space-y-4'
);

const modalFooterClasses = clsx(
  'flex justify-between items-center p-6',
  'border-t border-gray-200 dark:border-gray-700',
  'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'
);

const changesSummaryClasses = clsx(
  'text-sm text-gray-600 dark:text-gray-400'
);

const actionButtonsClasses = clsx(
  'flex space-x-3'
);

export function RolePermissionsModal({
  role,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: RolePermissionsModalProps) {
  // const t = useTranslations('admin.ROLE_PERMISSIONS');

  // Temporary static text - replace with translations later
  const translations = {
    TITLE: (roleName: string) => `Manage Permissions - ${roleName}`,
    SUBTITLE: 'Configure role permissions and access levels',
    SEARCH_PLACEHOLDER: 'Search permissions...',
    CHANGES_SUMMARY: (added: number, removed: number) =>
      `${added} permissions added, ${removed} permissions removed`,
    NO_CHANGES: 'No changes made',
    CANCEL: 'Cancel',
    SAVE_PERMISSIONS: 'Save Permissions',
    SAVING: 'Saving...',
    CLOSE: 'Close',
  };

  // State management
  const [permissionState, setPermissionState] = useState<PermissionState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['content', 'users', 'system']));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize permission state when role changes
  useEffect(() => {
    if (role?.permissions) {
      setPermissionState(createPermissionState(role.permissions));
    }
  }, [role]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setExpandedGroups(new Set(['content', 'users', 'system']));
    }
  }, [isOpen]);

  // Calculate current permissions and changes
  const currentPermissions = useMemo(() =>
    getSelectedPermissions(permissionState),
    [permissionState]
  );

  const changes = useMemo(() =>
    calculatePermissionChanges(role?.permissions || [], currentPermissions),
    [role?.permissions, currentPermissions]
  );

  const hasChanges = changes.added.length > 0 || changes.removed.length > 0;
  const isUnchanged = arePermissionsEqual(role?.permissions || [], currentPermissions);

  // Handle permission changes
  const handlePermissionChange = (permission: Permission, isSelected: boolean) => {
    setPermissionState(prev => ({
      ...prev,
      [permission]: isSelected
    }));
  };

  // Handle group expansion
  const handleToggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!role || isUnchanged || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onSave(role.id, currentPermissions);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close with confirmation if there are unsaved changes
  const handleClose = () => {
    if (hasChanges && !isSubmitting) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && hasChanges && !isUnchanged) {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, hasChanges, isUnchanged]);

  if (!isOpen || !role) return null;

  return (
    <div className={modalOverlayClasses} role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={modalBackdropClasses}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className={modalContainerClasses}>
        {/* Header */}
        <div className={modalHeaderClasses}>
          <div className={modalTitleClasses}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {translations.TITLE(role.name)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {translations.SUBTITLE}
              </p>
            </div>
          </div>

          {!isSubmitting && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              aria-label={translations.CLOSE}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className={modalBodyClasses}>
          {/* Search Section */}
          <div className={searchSectionClasses}>
            <Input
              placeholder={translations.SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              variant="bordered"
              size="sm"
              classNames={{
                input: "text-sm",
                inputWrapper: "bg-white dark:bg-gray-800"
              }}
            />
          </div>

          {/* Permissions Section */}
          <div className={permissionsSectionClasses}>
            {PERMISSION_GROUPS.map(group => (
              <PermissionGroupComponent
                key={group.id}
                group={group}
                permissionState={permissionState}
                onPermissionChange={handlePermissionChange}
                isExpanded={expandedGroups.has(group.id)}
                onToggleExpanded={() => handleToggleGroup(group.id)}
                disabled={isSubmitting}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={modalFooterClasses}>
          <div className={changesSummaryClasses}>
            {hasChanges ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>
                  {translations.CHANGES_SUMMARY(changes.added.length, changes.removed.length)}
                </span>
              </div>
            ) : (
              <span>{translations.NO_CHANGES}</span>
            )}
          </div>

          <div className={actionButtonsClasses}>
            <Button
              variant="bordered"
              onPress={handleClose}
              disabled={isSubmitting}
              startContent={<X size={16} />}
            >
              {translations.CANCEL}
            </Button>

            <Button
              color="primary"
              onPress={handleSave}
              isLoading={isSubmitting}
              disabled={isUnchanged}
              startContent={!isSubmitting && <Save size={16} />}
              className={clsx(
                'bg-gradient-to-r from-theme-primary to-theme-accent',
                'hover:from-theme-primary/90 hover:to-theme-accent/90',
                'shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40',
                'transition-all duration-300 text-white font-medium'
              )}
            >
              {isSubmitting ? translations.SAVING : translations.SAVE_PERMISSIONS}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}