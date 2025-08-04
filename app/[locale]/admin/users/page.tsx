'use client';

import { useState, useEffect, useRef } from 'react';
import { useUsers } from '@/hooks/use-users';
import { UserData, UserListOptions } from '@/lib/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { 
  Modal, 
  ModalContent, 
  ModalHeader 
} from '@/components/ui/modal';
import { 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';
import UserForm from '@/components/admin/users/user-form';
import DeleteUserDialog from '@/components/admin/users/delete-user-dialog';

export default function UsersPage() {
  const { 
    loading, 
    error, 
    getUsers, 
    deleteUser, 
    getUserStats,
    clearError 
  } = useUsers();

  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<UserListOptions>({
    search: '',
    role: '',
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isLoadingRef = useRef(false);

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      // Load users
      const requestOptions: UserListOptions = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      const result = await getUsers(requestOptions);
      setUsers(result.users);
      setPagination(prev => ({
        ...prev,
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }));

      // Load stats
      const statsData = await getUserStats();
      if (statsData) {
        setStats(statsData);
      }
    };
    initializeData();
  }, []);

  // Load users when filters change - using a simpler approach
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isLoadingRef.current) return;
      
      isLoadingRef.current = true;
      try {
        const requestOptions: UserListOptions = {
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        };

        const result = await getUsers(requestOptions);
        setUsers(result.users);
        setPagination(prev => ({
          ...prev,
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }));
      } finally {
        isLoadingRef.current = false;
      }
    }, 300); // Debounce the search
    
    return () => clearTimeout(timer);
  }, [filters.search, filters.role, filters.status, filters.sortBy, filters.sortOrder, pagination.page, pagination.limit, getUsers]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);



  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleFilter = (value: string) => {
    setFilters(prev => ({ ...prev, role: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value as 'active' | 'inactive' }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field as any,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserCreated = () => {
    setIsCreateDialogOpen(false);
    // Reload data
    const requestOptions: UserListOptions = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    };
    getUsers(requestOptions).then(result => {
      setUsers(result.users);
      setPagination(prev => ({
        ...prev,
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }));
    });
    getUserStats().then(statsData => {
      if (statsData) {
        setStats(statsData);
      }
    });
    toast.success('User created successfully');
  };

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    // Reload data
    const requestOptions: UserListOptions = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    };
    getUsers(requestOptions).then(result => {
      setUsers(result.users);
      setPagination(prev => ({
        ...prev,
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }));
    });
    getUserStats().then(statsData => {
      if (statsData) {
        setStats(statsData);
      }
    });
    toast.success('User updated successfully');
  };

  const handleUserDeleted = async () => {
    if (!selectedUser) return;

    const success = await deleteUser(selectedUser.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      // Reload data
      const requestOptions: UserListOptions = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      getUsers(requestOptions).then(result => {
        setUsers(result.users);
        setPagination(prev => ({
          ...prev,
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }));
      });
      getUserStats().then(statsData => {
        if (statsData) {
          setStats(statsData);
        }
      });
      toast.success('User deleted successfully');
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      'super-admin': 'bg-red-100 text-red-800',
      'admin': 'bg-blue-100 text-blue-800',
      'moderator': 'bg-purple-100 text-purple-800',
      'user': 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge variant="outline" className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and their permissions</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
        
        <Modal isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>
              <h2 className="text-lg font-semibold">Create New User</h2>
            </ModalHeader>
            <UserForm onSuccess={handleUserCreated} />
          </ModalContent>
        </Modal>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={filters.role} 
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
            <select 
              value={filters.status} 
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', role: '', status: 'active', sortBy: 'name', sortOrder: 'asc' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b font-medium text-sm">
                  <div>User</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div 
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort('created_at')}
                  >
                    Created
                  </div>
                  <div className="w-[50px]"></div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y">
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50">
                      <div>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                            {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">
                              @{user.username} • {user.email}
                            </p>
                            {user.title && (
                              <p className="text-xs text-gray-500">{user.title}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>{getRoleBadge(user.role)}</div>
                      <div>{getStatusBadge(user.status)}</div>
                      <div>
                        <span className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(user)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedUser && (
        <Modal isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>
              <h2 className="text-lg font-semibold">Edit User</h2>
            </ModalHeader>
            <UserForm 
              user={selectedUser} 
              onSuccess={handleUserUpdated}
            />
          </ModalContent>
        </Modal>
      )}

      {/* Delete Dialog */}
      {selectedUser && (
        <DeleteUserDialog
          user={selectedUser}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleUserDeleted}
        />
      )}
    </div>
  );
} 