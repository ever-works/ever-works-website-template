"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, Chip, useDisclosure } from "@heroui/react";
import { Plus, Edit, Trash2, Users, Search, Filter } from "lucide-react";
import { ClientForm } from "@/components/admin/clients/client-form";
import type { 
  ClientData, 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientWithUser 
} from "@/lib/types/client";
import { UniversalPagination } from "@/components/universal-pagination";
import { toast } from "sonner";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  clients?: T;
  client?: ClientData;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [limit] = useState(10);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        clientType: clientTypeFilter,
      });
      
      const response = await fetch(`/api/admin/clients?${params}`);
      const data: ApiResponse<ClientWithUser[]> = await response.json();
      
      if (data.success && data.clients) {
        setClients(data.clients);
        setTotalClients(data.total || 0);
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
  const handleCreate = async (data: CreateClientRequest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<ClientData> = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Client created successfully');
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
  const handleUpdate = async (data: UpdateClientRequest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/clients/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<ClientData> = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Client updated successfully');
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
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Client deleted successfully');
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

  const openEditForm = (client: ClientData) => {
    setSelectedClient(client);
    setFormMode('edit');
    onOpen();
  };

  const handleFormSubmit = async (data: CreateClientRequest | UpdateClientRequest) => {
    if (formMode === 'create') {
      await handleCreate(data as CreateClientRequest);
    } else {
      await handleUpdate(data as UpdateClientRequest);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClients(page);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPlanFilter('');
    setClientTypeFilter('');
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

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'enterprise': return 'success';
      case 'business': return 'primary';
      case 'individual': return 'default';
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
      <Card className="bg-white dark:bg-gray-800">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>

            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="bordered"
              onPress={handleSearch}
              startContent={<Search className="w-4 h-4" />}
            >
              Search
            </Button>
            <Button
              variant="bordered"
              onPress={handleClearFilters}
              startContent={<Filter className="w-4 h-4" />}
            >
              Clear Filters
            </Button>
          </div>
        </CardBody>
      </Card>

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
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter || planFilter || clientTypeFilter 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by adding your first client.'
                }
              </p>
              {!searchTerm && !statusFilter && !planFilter && !clientTypeFilter && (
                <Button color="primary" onPress={openCreateForm}>
                  Add First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {client.companyName || client.user.name || 'Unnamed Client'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {client.user.email}
                        </p>
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
                      <Chip size="sm" color={getClientTypeColor(client.clientType)}>
                        {client.clientType}
                      </Chip>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
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
                      onPress={() => handleDelete(client.id)}
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Client Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl">
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