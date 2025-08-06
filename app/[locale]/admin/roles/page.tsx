'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import { Button, Card, CardBody, Chip, useDisclosure, Input } from '@heroui/react';
import { RoleForm } from '@/components/admin/roles/role-form';
import { DeleteRoleDialog } from '@/components/admin/roles/delete-role-dialog';
import { RoleData, CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role';
import { toast } from 'sonner';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  roles?: T;
  role?: RoleData;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data: ApiResponse<RoleData[]> = await response.json();
      if (data.roles) {
        setRoles(data.roles);
      }
    } catch (error) {
      toast.error('Failed to fetch roles');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<RoleData> = await response.json();
      
      if (response.ok) {
        toast.success('Role created successfully');
        onClose();
        fetchRoles();
      } else {
        toast.error(result.error || 'Failed to create role');
      }
    } catch (error) {
      toast.error('Failed to create role');
      console.error('Error creating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<RoleData> = await response.json();
      
      if (response.ok) {
        toast.success('Role updated successfully');
        onClose();
        fetchRoles();
        setSelectedRole(null);
      } else {
        toast.error(result.error || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (hardDelete: boolean = false) => {
    if (!selectedRole) return;

    try {
      const url = hardDelete 
        ? `/api/admin/roles/${selectedRole.id}?hard=true`
        : `/api/admin/roles/${selectedRole.id}`;
      
      const response = await fetch(url, { method: 'DELETE' });

      if (response.ok) {
        toast.success(hardDelete ? 'Role permanently deleted' : 'Role deleted');
        fetchRoles();
        setSelectedRole(null);
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete role');
      }
    } catch (error) {
      toast.error('Failed to delete role');
      console.error('Error deleting role:', error);
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

  const handleFormSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    if (formMode === 'create') {
      await handleCreateRole(data);
    } else {
      await handleUpdateRole(data);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'inactive' && !role.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
            Role Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and permissions
          </p>
        </div>
        <Button 
          color="primary" 
          onPress={openCreateForm}
          startContent={<Plus size={16} />}
          className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg"
        >
          Create Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Roles</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{roles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Roles</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {roles.filter(role => role.isActive).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Inactive Roles</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {roles.filter(role => !role.isActive).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-500 dark:text-orange-400" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'solid' : 'flat'}
                color={statusFilter === 'all' ? 'primary' : 'default'}
                onPress={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'solid' : 'flat'}
                color={statusFilter === 'active' ? 'primary' : 'default'}
                onPress={() => setStatusFilter('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'solid' : 'flat'}
                color={statusFilter === 'inactive' ? 'primary' : 'default'}
                onPress={() => setStatusFilter('inactive')}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Roles List */}
      <div className="space-y-4">
        {filteredRoles.length === 0 ? (
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardBody className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No roles match your filters' 
                  : 'No roles found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Create your first role to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  color="primary" 
                  onPress={openCreateForm}
                  startContent={<Plus size={16} />}
                  className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90"
                >
                  Create First Role
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          filteredRoles.map((role) => (
            <Card 
              key={role.id} 
              className="group hover:bg-gradient-to-r hover:from-theme-primary/5 hover:to-theme-accent/5 dark:hover:from-theme-primary/10 dark:hover:to-theme-accent/10 transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left Section: Role Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Role Details */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Role Icon */}
                      <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Shield size={16} className="text-white" />
                      </div>

                      {/* Role Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-theme-primary transition-colors truncate">
                            {role.name}
                          </h4>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={role.isActive ? "success" : "danger"}
                            startContent={role.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                          >
                            {role.isActive ? 'Active' : 'Inactive'}
                          </Chip>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            ID: {role.id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {role.permissions.length} permissions
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => openEditForm(role)}
                      className="text-gray-500 hover:text-theme-primary"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => openDeleteDialog(role)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <RoleForm
              role={selectedRole || undefined}
              onSubmit={handleFormSubmit}
              onCancel={onClose}
              mode={formMode}
            />
          </div>
        </div>
      )}

      {selectedRole && (
        <DeleteRoleDialog
          role={selectedRole}
          onConfirm={handleDeleteRole}
          onCancel={handleDeleteCancel}
          isOpen={isDeleteDialogOpen}
        />
      )}
    </div>
  );
} 