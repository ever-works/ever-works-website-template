"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Card, CardBody, Chip, useDisclosure } from "@heroui/react";
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Search, ChevronDown, Building2, Eye, Zap } from "lucide-react";
import { toast } from "sonner";
import { ClientForm } from "@/components/admin/clients/client-form";
import { UniversalPagination } from "@/components/universal-pagination";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import type { ClientResponse, CreateClientRequest, UpdateClientRequest } from "@/lib/types/client";
import type { ClientProfileWithAuth } from "@/lib/db/queries";

export default function ClientsPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientProfileWithAuth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfileWithAuth | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [navigatingClientId, setNavigatingClientId] = useState<string | null>(null);

  // Delete confirmation state
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [limit] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState(false);

  // Date range filters
  const [createdAfter, setCreatedAfter] = useState<string>('');
  const [createdBefore, setCreatedBefore] = useState<string>('');
  const [updatedAfter, setUpdatedAfter] = useState<string>('');
  const [updatedBefore, setUpdatedBefore] = useState<string>('');

  // Stats state
  const [stats, setStats] = useState({
    overview: { total: 0, active: 0, inactive: 0, suspended: 0, trial: 0 },
    byProvider: { credentials: 0, google: 0, github: 0, facebook: 0, twitter: 0, linkedin: 0, other: 0 },
    byPlan: { free: 0, standard: 0, premium: 0 },
    byAccountType: { individual: 0, business: 0, enterprise: 0 },
    byStatus: { active: 0, inactive: 0, suspended: 0, trial: 0 },
    activity: { newThisWeek: 0, newThisMonth: 0, activeThisWeek: 0, activeThisMonth: 0 },
    growth: { weeklyGrowth: 0, monthlyGrowth: 0 }
  });

  // Performance tracking
  const [fetchDuration, setFetchDuration] = useState<number>(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  const clearEditParam = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    const nextHref = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
    router.replace(nextHref);
  }, [router]);

  const closeForm = useCallback(() => {
    onClose();
    clearEditParam();
    setSelectedClient(null);
  }, [onClose, clearEditParam]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Optimized function to fetch both clients and stats in a single request
  const fetchDashboardData = useCallback(async (page: number = currentPage) => {
    const startTime = performance.now();
    try {
      setIsLoading(true);
      setIsFiltering(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (planFilter) params.append('plan', planFilter);
      if (accountTypeFilter) params.append('accountType', accountTypeFilter);
      if (providerFilter) params.append('provider', providerFilter);
      if (createdAfter) params.append('createdAfter', createdAfter);
      if (createdBefore) params.append('createdBefore', createdBefore);
      if (updatedAfter) params.append('updatedAfter', updatedAfter);
      if (updatedBefore) params.append('updatedBefore', updatedBefore);


      const response = await fetch(`/api/admin/clients/dashboard?${params}`);

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Request failed (${response.status})`);
      }

      const data = await response.json();

      if (data.success) {
        // Update clients
        setClients(data.data.clients);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.page);
        setFilteredTotal(data.data.pagination.total);
        
        // Update stats
        setStats(data.data.stats);
        
        // Track performance
        const endTime = performance.now();
        const duration = endTime - startTime;
        setFetchDuration(duration);
      } else {
        toast.error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  }, [debouncedSearchTerm, statusFilter, planFilter, accountTypeFilter, providerFilter, currentPage, limit, createdAfter, createdBefore, updatedAfter, updatedBefore]);

  // Create client
  const handleCreate = async (data: CreateClientRequest) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Request failed (${response.status})`);
      }

      const result: ClientResponse = await response.json();

      if (result.success) {
        toast.success('Client created successfully');
        closeForm();
        fetchDashboardData();
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
      const safeId = encodeURIComponent(data.id);
      const response = await fetch(`/api/admin/clients/${safeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Request failed (${response.status})`);
      }

      const result: ClientResponse = await response.json();

      if (result.success) {
        toast.success('Client updated successfully');
        closeForm();
        fetchDashboardData();
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

  // Show delete confirmation modal
  const handleDeleteClick = (compositeKey: string) => {
    setClientToDelete(compositeKey);
    onDeleteOpen();
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      const safeId = encodeURIComponent(clientToDelete);
      const response = await fetch(`/api/admin/clients/${safeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Request failed (${response.status})`);
      }

      const result: ClientResponse = await response.json();

      if (result.success) {
        toast.success('Client deleted successfully');
        fetchDashboardData();
      } else {
        toast.error(result.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client');
    } finally {
      setClientToDelete(null);
      onDeleteClose();
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setClientToDelete(null);
    onDeleteClose();
  };

  // Form handlers
  const openCreateForm = () => {
    setSelectedClient(null);
    setFormMode('create');
    onOpen();
  };

  const openEditForm = (client: ClientProfileWithAuth) => {
    setSelectedClient(client);
    setFormMode('edit');
    onOpen();
  };

  const viewClientDetails = (clientId: string) => {
    setNavigatingClientId(clientId);
    const locale = (params?.locale ?? 'en').toString();
    const safeLocale = encodeURIComponent(locale);
    const safeId = encodeURIComponent(clientId);
    router.push(`/${safeLocale}/admin/clients/${safeId}`);
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
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('active');
    setPlanFilter('');
    setAccountTypeFilter('');
    setProviderFilter('');
    setCreatedAfter('');
    setCreatedBefore('');
    setUpdatedAfter('');
    setUpdatedBefore('');
    setCurrentPage(1);
    // Optional: short-circuit debounce for immediate fetch
    fetchDashboardData(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    fetchDashboardData(1);
  };

  const handlePlanFilter = (value: string) => {
    setPlanFilter(value);
    setCurrentPage(1);
    fetchDashboardData(1);
  };

  const handleAccountTypeFilter = (value: string) => {
    setAccountTypeFilter(value);
    setCurrentPage(1);
    fetchDashboardData(1);
  };

  const handleProviderFilter = (value: string) => {
    setProviderFilter(value);
    setCurrentPage(1);
    fetchDashboardData(1);
  };

  // Initial fetch on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchDashboardData();
      } finally {
        isInitialLoad.current = false; // Mark initial load as complete
      }
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Open edit modal when ?edit=<id> is present
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      // First try to find in existing clients
      const existing = clients.find((c) => c.id === editId);
      if (existing) {
        setSelectedClient(existing);
        setFormMode('edit');
        onOpen();
        return;
      }

      // If not found in existing clients and we're not loading, fetch individually
      if (!isLoading) {
        (async () => {
          try {
            const resp = await fetch(`/api/admin/clients/${encodeURIComponent(editId)}`);
            if (!resp.ok) throw new Error('Failed to load client');
            const data: ClientResponse = await resp.json();
            if (data.success && (data as any).data) {
              setSelectedClient((data as any).data as ClientProfileWithAuth);
              setFormMode('edit');
              onOpen();
            } else {
              toast.error('Client not found');
            }
          } catch (e) {
            console.error(e);
            toast.error('Failed to load client');
          }
        })();
      }
    } else {
      if (isOpen) onClose();
      setSelectedClient(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, clients, isLoading]);

  // Fetch when filters change (excluding search term which has its own debounced effect)
  useEffect(() => {
    // Skip if this is the initial load
    if (!isInitialLoad.current) {
      fetchDashboardData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, planFilter, accountTypeFilter, providerFilter, createdAfter, createdBefore, updatedAfter, updatedBefore]);

  // Fetch when debounced search term changes, including when cleared
  useEffect(() => {
    if (!isInitialLoad.current) {
      fetchDashboardData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

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

  if (isLoading && clients.length === 0) {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }, (_, i) => (
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
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Modern Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your clients and their information
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
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.active}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserX aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.suspended}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserX aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Enhanced Stats Cards */}
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activity.newThisWeek}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">+{stats.growth.weeklyGrowth}% growth</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activity.activeThisMonth}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Engaged users</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Provider</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const providers = Object.entries(stats.byProvider);
                    const topProvider = providers.reduce((a, b) => a[1] > b[1] ? a : b);
                    return topProvider[0].charAt(0).toUpperCase() + topProvider[0].slice(1);
                  })()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(() => {
                    const providers = Object.entries(stats.byProvider);
                    const topProvider = providers.reduce((a, b) => a[1] > b[1] ? a : b);
                    return `${topProvider[1]} users`;
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Performance Indicator */}
        {fetchDuration > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Performance</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Last fetch: {fetchDuration.toFixed(0)}ms • Optimized single query
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap aria-hidden="true" className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Modern SaaS-Style Filters */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search clients"
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
          {/* Status Filter */}
          <div className="relative">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="">All Status</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Plan Filter */}
          <div className="relative">
            <select
              aria-label="Filter by plan"
              value={planFilter}
              onChange={(e) => handlePlanFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Account Type Filter */}
          <div className="relative">
            <select
              value={accountTypeFilter}
              onChange={(e) => handleAccountTypeFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Provider Filter */}
          <div className="relative">
            <select
              aria-label="Filter by provider"
              value={providerFilter}
              onChange={(e) => handleProviderFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
            >
              <option value="">All Providers</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">Date Filters</span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Created After</label>
                <input
                  type="date"
                  aria-label="Filter by created after"
                  value={createdAfter}
                  onChange={(e) => setCreatedAfter(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Created Before</label>
                <input
                  type="date"
                  aria-label="Filter by created before"
                  value={createdBefore}
                  onChange={(e) => setCreatedBefore(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Updated After</label>
                <input
                  type="date"
                  aria-label="Filter by updated after"
                  value={updatedAfter}
                  onChange={(e) => setUpdatedAfter(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Updated Before</label>
                <input
                  type="date"
                  aria-label="Filter by updated before"
                  value={updatedBefore}
                  onChange={(e) => setUpdatedBefore(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(searchTerm || statusFilter !== 'active' || planFilter || accountTypeFilter || providerFilter || createdAfter || createdBefore || updatedAfter || updatedBefore) && (
          <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {(() => {
                const count = [
                  searchTerm && 'search',
                  statusFilter !== 'active' && 'status',
                  planFilter && 'plan',
                  accountTypeFilter && 'type',
                  providerFilter && 'provider',
                  createdAfter && 'createdAfter',
                  createdBefore && 'createdBefore',
                  updatedAfter && 'updatedAfter',
                  updatedBefore && 'updatedBefore',
                ].filter(Boolean).length;
                return `${count} filter${count !== 1 ? 's' : ''} applied`;
              })()}
            </span>
            <Button
              variant="light"
              size="sm"
              color="danger"
              onPress={clearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {clients.length} of {filteredTotal} {(searchTerm || statusFilter !== 'active' || planFilter || accountTypeFilter || providerFilter || createdAfter || createdBefore || updatedAfter || updatedBefore) ? 'filtered ' : ''}clients
            </span>
            {totalPages > 1 && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        )}

        {/* Provider Distribution Overview */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Authentication Provider Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byProvider).map(([provider, count]) => (
              <div key={provider} className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{count}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {provider === 'credentials' ? 'Email/Password' : provider}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan & Account Type Overview */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Plan Distribution</h4>
            <div className="space-y-2">
              {Object.entries(stats.byPlan).map(([plan, count]) => (
                <div key={plan} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{plan}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account Type Distribution</h4>
            <div className="space-y-2">
              {Object.entries(stats.byAccountType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <Card className="border-0 shadow-lg">
        <CardBody className="p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clients</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.overview.total} clients total
              </span>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'active' || planFilter || accountTypeFilter || providerFilter || createdAfter || createdBefore || updatedAfter || updatedBefore
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by adding your first client.'
                }
              </p>
              {!searchTerm && statusFilter === 'active' && !planFilter && !accountTypeFilter && !providerFilter && (
                <Button color="primary" onPress={openCreateForm}>
                  Add First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {clients.map((client) => (
                <div key={client.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">#{client.id.slice(0, 8)}</span>
                      </div>
                      <button
                        type="button"
                        aria-disabled={navigatingClientId === client.id}
                        aria-busy={navigatingClientId === client.id}
                        className={`text-left flex items-center space-x-3 rounded-lg p-2 -m-2 transition-colors flex-1 min-w-0 ${navigatingClientId === client.id
                          ? 'cursor-wait opacity-60'
                          : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        onClick={() => navigatingClientId !== client.id && viewClientDetails(client.id)}
                        onKeyDown={(e) => {
                          if (navigatingClientId === client.id) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            viewClientDetails(client.id);
                          }
                        }}
                        title={navigatingClientId === client.id ? 'Loading...' : 'Click to view client details'}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full flex items-center justify-center text-white font-semibold text-sm relative">
                          {navigatingClientId === client.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            (client.displayName || client.name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="font-medium text-gray-900 dark:text-white hover:text-theme-primary transition-colors">
                            {client.displayName || client.name || 'Unnamed Client'}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {client.username ? `@${client.username}` : ''} {client.username && client.email ? '•' : ''} {client.email || ''}
                          </p>
                          {client.jobTitle && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{client.jobTitle}</p>
                          )}
                          {client.company && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{client.company}</p>
                          )}
                        </div>
                      </button>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex items-center space-x-1">
                        <Chip
                          color={getStatusColor(client.status || 'active')}
                          variant="flat"
                          size="sm"
                        >
                          {(client.status || 'active').charAt(0).toUpperCase() + (client.status || 'active').slice(1)}
                        </Chip>
                        <Chip
                          color={getPlanColor(client.plan || 'free')}
                          variant="flat"
                          size="sm"
                        >
                          {(client.plan || 'free').charAt(0).toUpperCase() + (client.plan || 'free').slice(1)}
                        </Chip>
                        <Chip
                          color={getAccountTypeColor(client.accountType || 'individual')}
                          variant="flat"
                          size="sm"
                        >
                          {(client.accountType || 'individual').charAt(0).toUpperCase() + (client.accountType || 'individual').slice(1)}
                        </Chip>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          color="default"
                          variant="light"
                          isDisabled={navigatingClientId === client.id}
                          onPress={() => viewClientDetails(client.id)}
                          startContent={
                            navigatingClientId === client.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Eye className="w-4 h-4" />
                            )
                          }
                        >
                          {navigatingClientId === client.id ? 'Loading...' : 'View'}
                        </Button>
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          onPress={() => openEditForm(client)}
                          startContent={<Edit className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteClick(client.id)}
                          startContent={<Trash2 className="w-4 h-4" />}
                        >
                          Delete
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
        <div className="flex justify-center mt-8">
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
              onCancel={closeForm}
              isLoading={isSubmitting}
              mode={formMode}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Delete Client
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this client? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  color="default"
                  variant="bordered"
                  onPress={cancelDelete}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 