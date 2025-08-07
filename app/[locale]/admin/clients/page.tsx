"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, Chip, useDisclosure } from "@heroui/react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { ClientForm } from "@/components/admin/clients/client-form";
import { UniversalPagination } from "@/components/universal-pagination";
import type { ClientWithUser, ClientListResponse, ClientResponse } from "@/lib/types/client";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputClass =
    "w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const selectClass =
    "px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const buttonClass =
    "px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";

  // Fetch clients
  const fetchClients = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        status: statusFilter,
        plan: planFilter,
        accountType: accountTypeFilter,
      });
      
      const response = await fetch(`/api/admin/clients?${params}`);
      const data: ClientListResponse = await response.json();
      
      if (data.success) {
        setClients(data.data.clients);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      } else {
        toast.error(data.error || 'Failed to fetch clients');
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  };

  // Create client
  const handleCreate = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ClientResponse = await response.json();
      
      if (result.success) {
        toast.success('Client created successfully');
        onClose();
        fetchClients();
      } else {
        toast.error(result.error || 'Failed to create client');
      }
    } catch (error) {
      console.error('Failed to create client:', error);
      toast.error('Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update client
  const handleUpdate = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/clients/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ClientResponse = await response.json();
      
      if (result.success) {
        toast.success('Client updated successfully');
        onClose();
        fetchClients();
      } else {
        toast.error(result.error || 'Failed to update client');
      }
    } catch (error) {
      console.error('Failed to update client:', error);
      toast.error('Failed to update client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete client
  const handleDelete = async (compositeKey: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${compositeKey}`, {
        method: 'DELETE',
      });
      
      const result: ClientResponse = await response.json();
      
      if (result.success) {
        toast.success('Client deleted successfully');
        fetchClients();
      } else {
        toast.error(result.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client');
    }
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedClient(null);
    setFormMode('create');
    onOpen();
  };

  const openEditForm = (client: any) => {
    setSelectedClient(client);
    setFormMode('edit');
    onOpen();
  };

  const handleFormSubmit = async (data: any) => {
    if (formMode === 'create') {
      await handleCreate(data as any);
    } else {
      await handleUpdate(data as any);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClients(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPlanFilter('');
    setAccountTypeFilter('');
    setCurrentPage(1);
    fetchClients(1);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'danger';
      case 'trial': return 'warning';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'success';
      case 'standard': return 'primary';
      case 'free': return 'default';
      default: return 'default';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'default';
      case 'business': return 'primary';
      case 'enterprise': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your clients and their information
          </p>
        </div>
        <Button
          color="primary"
          onPress={openCreateForm}
          startContent={<Plus className="w-4 h-4" />}
        >
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClass}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="trial">Trial</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>

          {/* Account Type Filter */}
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Types</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter || planFilter || accountTypeFilter) && (
            <button
              onClick={clearFilters}
              className={buttonClass}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Clients List */}
      <Card className="bg-white dark:bg-gray-800">
        <CardBody>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter || planFilter || accountTypeFilter 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by adding your first client.'
                }
              </p>
              {!searchTerm && !statusFilter && !planFilter && !accountTypeFilter && (
                <Button color="primary" onPress={openCreateForm}>
                  Add First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={`${client.userId}:${client.provider}:${client.providerAccountId}`}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {client.displayName || client.user.name || 'Unnamed Client'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {client.user.email}
                        </p>
                        {client.username && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            @{client.username}
                          </p>
                        )}
                        {client.jobTitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {client.jobTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Chip size="sm" color={getStatusColor(client.status)}>
                        {client.status}
                      </Chip>
                      <Chip size="sm" color={getPlanColor(client.plan)}>
                        {client.plan}
                      </Chip>
                      <Chip size="sm" color={getAccountTypeColor(client.accountType)}>
                        {client.accountType}
                      </Chip>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="bordered"
                      onPress={() => openEditForm(client)}
                      startContent={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="bordered"
                      onPress={() => handleDelete(`${client.userId}:${client.provider}:${client.providerAccountId}`)}
                      startContent={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <UniversalPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Client Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <ClientForm
              client={selectedClient || undefined}
              onSubmit={handleFormSubmit}
              onCancel={onClose}
              isLoading={isSubmitting}
              mode={formMode}
            />
          </div>
        </div>
      )}
    </div>
  );
} 