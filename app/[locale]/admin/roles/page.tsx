'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, ShieldCheck, ChevronDown, Settings } from 'lucide-react';
import { Button, Card, CardBody, Chip, useDisclosure } from '@heroui/react';
import { RoleForm } from '@/components/admin/roles/role-form';
import { DeleteRoleDialog } from '@/components/admin/roles/delete-role-dialog';
import { RolePermissionsModal } from '@/components/admin/permissions/role-permissions-modal';
import { useAdminRoles, RoleData, CreateRoleRequest, UpdateRoleRequest } from '@/hooks/use-admin-roles';
import { Permission } from '@/lib/permissions/definitions';
import clsx from 'clsx';

// CSS classes constants
const headerContainerClass = clsx(
  'bg-gradient-to-r from-white via-gray-50 to-white',
  'dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  'rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6'
);

const headerIconClass = clsx(
  'w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent',
  'rounded-xl flex items-center justify-center shadow-lg'
);

const headerTitleClass = clsx(
  'text-2xl sm:text-3xl font-bold bg-gradient-to-r',
  'from-gray-900 to-gray-600 dark:from-white dark:to-gray-300',
  'bg-clip-text text-transparent'
);

const addButtonClass = clsx(
  'bg-gradient-to-r from-theme-primary to-theme-accent',
  'hover:from-theme-primary/90 hover:to-theme-accent/90',
  'shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40',
  'transition-all duration-300 text-white font-medium'
);

const searchInputClass = clsx(
  'w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700 rounded-xl',
  'focus:outline-none focus:ring-2 focus:ring-theme-primary/20',
  'focus:border-theme-primary transition-all duration-200',
  'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
);

const filterSelectClass = clsx(
  'appearance-none bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700 rounded-full',
  'px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white',
  'focus:outline-none focus:ring-2 focus:ring-theme-primary/20',
  'focus:border-theme-primary transition-all duration-200 cursor-pointer'
);

function getAvatarColor(identifier: string): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-red-500 to-red-600',
    'from-yellow-500 to-yellow-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
    'from-cyan-500 to-cyan-600',
    'from-emerald-500 to-emerald-600',
    'from-violet-500 to-violet-600'
  ];

  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

export default function RolesPage() {
  // Use custom hook
  const {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    isSubmitting,
  } = useAdminRoles();

  // Local state for form and dialogs
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleTypeFilter, setRoleTypeFilter] = useState<'all' | 'admin' | 'client'>('all');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter roles based on search, status, and role type
  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    const matchesRoleType = roleTypeFilter === 'all' ||
                           (roleTypeFilter === 'admin' && role.isAdmin) ||
                           (roleTypeFilter === 'client' && !role.isAdmin);
    return matchesSearch && matchesStatus && matchesRoleType;
  });

  // Calculate stats
  const stats = {
    total: roles.length,
    active: roles.filter(role => role.status === 'active').length,
    inactive: roles.filter(role => role.status === 'inactive').length,
    admin: roles.filter(role => role.isAdmin).length,
    client: roles.filter(role => !role.isAdmin).length,
  };

  // Handler functions
  const handleCreateRole = async (data: CreateRoleRequest) => {
    const ok = await createRole(data);
    if (ok) onClose();
  };

  const handleUpdateRole = async (data: UpdateRoleRequest) => {
    if (!selectedRole) return;
    const ok = await updateRole(selectedRole.id, data);
    if (ok) {
      onClose();
      setSelectedRole(null);
    }
  };

  const handleDeleteRole = async (hardDelete: boolean = false) => {
    if (!selectedRole) return;
    const ok = await deleteRole(selectedRole.id, hardDelete);
    if (ok) {
      setSelectedRole(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedRole(null);
    onOpen();
  };

  const openEditForm = (role: RoleData) => {
    setFormMode('edit');
    setSelectedRole(role);
    onOpen();
  };

  const openDeleteDialog = (role: RoleData) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const openPermissionsModal = (role: RoleData) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  const closePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setSelectedRole(null);
  };

  const handleFormSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    if (formMode === 'create') {
      await handleCreateRole(data as CreateRoleRequest);
    } else {
      await handleUpdateRole(data as UpdateRoleRequest);
    }
  };

  const handlePermissionsSave = async (roleId: string, permissions: Permission[]): Promise<boolean> => {
    try {
      // Use the dedicated permissions API
      const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update permissions');
      }

      // Refresh the roles list to show updated permissions
      refreshData();

      return true;
    } catch (error) {
      console.error('Failed to update permissions:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Loading Header */}
        <div className="mb-8">
          <div className={headerContainerClass}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                <div>
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Loading Table */}
        <Card className="border-0 shadow-lg">
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex space-x-1">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Loading indicator with text */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading roles...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className={headerContainerClass}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={headerIconClass}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={headerTitleClass}>
                  Role Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                  <span>Manage user roles and permissions</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-sm px-2 py-1 bg-theme-primary/10 text-theme-primary rounded-full font-medium">
                    {stats.total} total
                  </span>
                </p>
              </div>
            </div>
            <Button
              color="primary"
              size="lg"
              onPress={openCreateForm}
              startContent={<Plus size={18} />}
              className={addButtonClass}
            >
              Add Role
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Roles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.admin}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Client Roles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.client}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Modern SaaS-Style Filters */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search aria-hidden="true" focusable="false" className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search roles"
            className={searchInputClass}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              aria-label="Filter by status"
              className={filterSelectClass}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown aria-hidden="true" focusable="false" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Role Type Filter */}
          <div className="relative">
            <select
              value={roleTypeFilter}
              onChange={(e) => setRoleTypeFilter(e.target.value as 'all' | 'admin' | 'client')}
              aria-label="Filter by role type"
              className={filterSelectClass}
            >
              <option value="all">All Types</option>
              <option value="admin">Admin Roles</option>
              <option value="client">Client Roles</option>
            </select>
            <ChevronDown aria-hidden="true" focusable="false" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Active Filters Count */}
          {(searchTerm || statusFilter !== 'all' || roleTypeFilter !== 'all') && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {[
                  searchTerm && 'search',
                  statusFilter !== 'all' && 'status',
                  roleTypeFilter !== 'all' && 'type'
                ].filter(Boolean).length} filter{[
                  searchTerm && 'search',
                  statusFilter !== 'all' && 'status',
                  roleTypeFilter !== 'all' && 'type'
                ].filter(Boolean).length !== 1 ? 's' : ''} applied
              </span>
              <Button
                variant="light"
                size="sm"
                color="danger"
                onPress={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleTypeFilter('all');
                }}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {filteredRoles.length} of {stats.total} roles
            {(searchTerm || statusFilter !== 'all' || roleTypeFilter !== 'all') && (
              <span className="ml-1">
                • filtered
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Roles Table */}
      <Card className="border-0 shadow-lg">
        <CardBody className="p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.total} roles total
              </span>
            </div>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No roles found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or create a new role.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredRoles.map((role) => (
                <div key={role.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={clsx('w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-semibold text-sm', getAvatarColor(role.name || role.id))}>
                          {role.name?.charAt(0).toUpperCase() || 'R'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{role.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {role.isAdmin ? 'Admin Role' : 'Client Role'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Chip
                        color={role.status === 'active' ? 'success' : 'default'}
                        variant="flat"
                        size="sm"
                      >
                        {role.status === 'active' ? 'Active' : 'Inactive'}
                      </Chip>
                      <div className="flex space-x-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => openPermissionsModal(role)}
                          title="Manage Permissions"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => openEditForm(role)}
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => openDeleteDialog(role)}
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Form Modal - Using Reliable CSS Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="role-form-title">
          <div
            className="fixed inset-0 bg-black bg-opacity-60"
            role="button"
            tabIndex={0}
            aria-label="Close modal"
            onClick={() => {
              if (!isSubmitting) {
                onClose();
              }
            }}
            onKeyDown={(e) => {
              if (!isSubmitting && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) onClose();
            }}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 id="role-form-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Create New Role' : 'Edit Role'}
              </h2>
              {!isSubmitting && (
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
              <RoleForm
                role={selectedRole || undefined}
                onSubmit={handleFormSubmit}
                onCancel={onClose}
                mode={formMode}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {selectedRole && (
        <DeleteRoleDialog
          role={selectedRole}
          onConfirm={handleDeleteRole}
          onCancel={handleDeleteCancel}
          isOpen={isDeleteDialogOpen}
        />
      )}

      {/* Permissions Modal */}
      {selectedRole && (
        <RolePermissionsModal
          role={selectedRole}
          isOpen={isPermissionsModalOpen}
          onClose={closePermissionsModal}
          onSave={handlePermissionsSave}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}