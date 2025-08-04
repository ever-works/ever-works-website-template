"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, Chip, useDisclosure } from "@heroui/react";
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Search, ChevronDown } from "lucide-react";
import UserForm from "@/components/admin/users/user-form";
import { UserData, CreateUserRequest, UpdateUserRequest, UserWithCount } from "@/lib/types/user";
import { toast } from "sonner";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  users?: T;
  user?: UserData;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  
  // Stats state
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch users
  const fetchUsers = async (page: number = currentPage) => {
    try {
      if (page === 1) {
        setIsFiltering(true);
      } else {
        setIsLoading(true);
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      const data: ApiResponse<UserWithCount[]> = await response.json();
      
      if (data.users) {
        setUsers(data.users);
        setTotalUsers(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      } else {
        toast.error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats');
      const data = await response.json();
      if (data.total !== undefined) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Create user
  const handleCreate = async (data: CreateUserRequest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<UserData> = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'User created successfully');
        onClose();
        fetchUsers();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update user
  const handleUpdate = async (data: UpdateUserRequest & { id: string }) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/users/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<UserData> = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'User updated successfully');
        onClose();
        fetchUsers();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'User deleted successfully');
        fetchUsers();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedUser(null);
    onOpen();
  };

  const openEditForm = (user: UserData) => {
    setFormMode('edit');
    setSelectedUser(user);
    onOpen();
  };

  const handleFormSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (formMode === 'create') {
      await handleCreate(data as CreateUserRequest);
    } else {
      if (selectedUser) {
        await handleUpdate({ ...data, id: selectedUser.id } as UpdateUserRequest & { id: string });
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Add debouncing for search
    const timeoutId = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    fetchUsers(1);
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Loading Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
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
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
            <span className="text-sm font-medium">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                  <span>Manage platform users and their permissions</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-sm px-2 py-1 bg-theme-primary/10 text-theme-primary rounded-full font-medium">
                    {totalUsers} total
                  </span>
                </p>
              </div>
            </div>
            <Button
              color="primary"
              size="lg"
              onPress={openCreateForm}
              startContent={<Plus size={18} />}
              className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40 transition-all duration-300 text-white font-medium"
            >
              Add User
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserX className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

            {/* Modern SaaS-Style Filters */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {isFiltering && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="relative">
            <select 
              value={roleFilter} 
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Active Filters Count */}
          {(searchTerm || roleFilter || statusFilter !== 'active') && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {[
                  searchTerm && 'search',
                  roleFilter && 'role',
                  statusFilter !== 'active' && 'status'
                ].filter(Boolean).length} filter{[
                  searchTerm && 'search',
                  roleFilter && 'role',
                  statusFilter !== 'active' && 'status'
                ].filter(Boolean).length !== 1 ? 's' : ''} applied
              </span>
              <Button
                variant="light"
                size="sm"
                color="danger"
                onPress={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('active');
                  setCurrentPage(1);
                  fetchUsers(1);
                }}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {!isLoading && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {users.length} of {totalUsers} users
              {(searchTerm || roleFilter || statusFilter !== 'active') && (
                <span className="ml-1">
                  • filtered
                </span>
              )}
            </span>
            {totalPages > 1 && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardBody className="p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalUsers} users total
              </span>
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or create a new user.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">#{user.id}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{user.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username} • {user.email}
                          </p>
                          {user.title && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{user.title}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Chip
                        color={user.status === 'active' ? 'success' : 'default'}
                        variant="flat"
                        size="sm"
                      >
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Chip>
                      <Chip
                        color="primary"
                        variant="flat"
                        size="sm"
                      >
                        {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Chip>
                      <div className="flex space-x-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => openEditForm(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleDelete(user.id)}
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

             {/* Pagination */}
       {totalPages > 1 && (
         <div className="mt-6 flex justify-center">
           <div className="flex space-x-2">
             <Button
               variant="bordered"
               size="sm"
               disabled={currentPage === 1}
               onPress={() => handlePageChange(currentPage - 1)}
             >
               Previous
             </Button>
             <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
               Page {currentPage} of {totalPages}
             </span>
             <Button
               variant="bordered"
               size="sm"
               disabled={currentPage === totalPages}
               onPress={() => handlePageChange(currentPage + 1)}
             >
               Next
             </Button>
           </div>
         </div>
       )}

             {/* Form Modal - Using Reliable CSS Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-60" 
            onClick={() => {
              if (!isSubmitting) {
                console.log('🔷 Closing modal via backdrop click');
                onClose();
              }
            }}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Create New User' : 'Edit User'}
              </h2>
              {!isSubmitting && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
              <UserForm
                user={selectedUser || undefined}
                onSuccess={handleFormSubmit}
                isSubmitting={isSubmitting}
                onCancel={onClose}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 