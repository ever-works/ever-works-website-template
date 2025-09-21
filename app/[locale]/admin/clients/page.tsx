"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Card, CardBody, Chip, useDisclosure } from "@heroui/react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Select, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Users, UserCheck, Search, Building2, Eye, Shield, TrendingUp, Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ClientForm } from "@/components/admin/clients/client-form";
import { UniversalPagination } from "@/components/universal-pagination";
import { LoadingSpinner, InlineLoading } from "@/components/ui/loading-spinner";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import type { ClientResponse, CreateClientRequest, UpdateClientRequest } from "@/lib/types/client";
import type { ClientProfileWithAuth } from "@/lib/db/queries";
import type { ClientsLoadingState, LoadingStateKey } from "@/types/loading";

// Helper functions for provider stats
function getTopProviderName(byProvider: Record<string, number>): string {
  const providers = Object.entries(byProvider || {});
  if (providers.length === 0 || providers.every(([, n]) => n === 0)) return '—';
  const [key] = providers.reduce((a, b) => (a[1] > b[1] ? a : b));
  return key === 'credentials' ? 'Email' : key.charAt(0).toUpperCase() + key.slice(1);
}

function getTopProviderCount(byProvider: Record<string, number>): number {
  const providers = Object.entries(byProvider || {});
  if (providers.length === 0 || providers.every(([, n]) => n === 0)) return 0;
  const topProvider = providers.reduce((a, b) => (a[1] > b[1] ? a : b));
  return topProvider[1];
}

export default function ClientsPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientProfileWithAuth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfileWithAuth | null>(null);

  // Granular loading states
  const [loadingStates, setLoadingStates] = useState<ClientsLoadingState>({
    initial: true,
    searching: false,
    filtering: false,
    paginating: false,
    submitting: false,
    deleting: null as string | null,
  });

  // Helper functions for updating loading states
  const updateLoadingState = useCallback((key: LoadingStateKey | 'deleting', value: boolean | string | null) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const setSearchingLoading = useCallback((loading: boolean) => updateLoadingState('searching', loading), [updateLoadingState]);
  const setFilteringLoading = useCallback((loading: boolean) => updateLoadingState('filtering', loading), [updateLoadingState]);
  const setPaginatingLoading = useCallback((loading: boolean) => updateLoadingState('paginating', loading), [updateLoadingState]);
  const setSubmittingLoading = useCallback((loading: boolean) => updateLoadingState('submitting', loading), [updateLoadingState]);
  const setDeletingLoading = useCallback((clientId: string | null) => updateLoadingState('deleting', clientId), [updateLoadingState]);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [navigatingClientId, setNavigatingClientId] = useState<string | null>(null);

  // Delete confirmation state
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState(false);

  // Date filters - improved UX
  const [datePreset, setDatePreset] = useState<'all' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');
  const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>('created');

  // Legacy date filters (computed from new UX state)
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

  // Compute date range from preset selection
  const computeDateRange = useCallback((preset: typeof datePreset) => {
    const now = new Date();
    let from = '';
    let to = '';

    switch (preset) {
      case 'last7':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'last30':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'last90':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'thisMonth':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'custom':
        from = customDateFrom;
        to = customDateTo;
        break;
      default: // 'all'
        from = '';
        to = '';
    }

    return { from, to };
  }, [customDateFrom, customDateTo]);

  // Update legacy date filters when UX state changes
  useEffect(() => {
    const { from, to } = computeDateRange(datePreset);
    
    if (dateFilterType === 'created') {
      setCreatedAfter(from);
      setCreatedBefore(to);
      setUpdatedAfter('');
      setUpdatedBefore('');
    } else {
      setUpdatedAfter(from);
      setUpdatedBefore(to);
      setCreatedAfter('');
      setCreatedBefore('');
    }
  }, [datePreset, dateFilterType, computeDateRange]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isFilterModalOpen, onOpen: onOpenFilterModal, onClose: onCloseFilterModal } = useDisclosure();

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  // Calculate active filter count
  const activeFilterCount = [
    searchTerm,
    statusFilter,
    planFilter,
    accountTypeFilter,
    providerFilter,
    datePreset !== 'all' ? 'dateFilter' : null,
  ].filter(Boolean).length;

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
  const fetchDashboardData = useCallback(async (page: number = currentPage, isPagination = false) => {
    const requestId = Date.now();
    (fetchDashboardData as any)._last = requestId;
    try {
      setIsLoading(true);
      setIsFiltering(true);

      // Set appropriate granular loading state
      if (isPagination) {
        setPaginatingLoading(true);
      } else if (debouncedSearchTerm) {
        setSearchingLoading(true);
      } else {
        setFilteringLoading(true);
      }
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
      if ((fetchDashboardData as any)._last !== requestId) return; // drop stale

      if (data.success) {
        // Update clients
        setClients(data.data.clients);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.page);
        setTotalCount(data.data.pagination.total);
        
        // Update stats
        setStats(data.data.stats);
      } else {
        toast.error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
      setIsFiltering(false);

      // Clear all granular loading states
      setPaginatingLoading(false);
      setSearchingLoading(false);
      setFilteringLoading(false);
      updateLoadingState('initial', false);
    }
  }, [debouncedSearchTerm, statusFilter, planFilter, accountTypeFilter, providerFilter, currentPage, limit, createdAfter, createdBefore, updatedAfter, updatedBefore, setPaginatingLoading, setSearchingLoading, setFilteringLoading, updateLoadingState]);

  // Create client
  const handleCreate = async (data: CreateClientRequest) => {
    try {
      setIsSubmitting(true);
      setSubmittingLoading(true);
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
      setSubmittingLoading(false);
    }
  };

  // Update client
  const handleUpdate = async (data: UpdateClientRequest) => {
    try {
      setIsSubmitting(true);
      setSubmittingLoading(true);
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
      setSubmittingLoading(false);
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
      setDeletingLoading(clientToDelete);
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
      setDeletingLoading(null);
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
    fetchDashboardData(page, true); // true indicates this is pagination
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPlanFilter('');
    setAccountTypeFilter('');
    setProviderFilter('');
    setDatePreset('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setDateFilterType('created');
    setCurrentPage(1);
    // Optional: short-circuit debounce for immediate fetch
    fetchDashboardData(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
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

  if (loadingStates.initial && clients.length === 0) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Clients */}
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{stats.activity.newThisWeek} this week
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Active Clients */}
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.active}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.overview.total > 0 ? Math.round((stats.overview.active / stats.overview.total) * 100) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Top Provider */}
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Provider</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {getTopProviderName(stats.byProvider)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getTopProviderCount(stats.byProvider)} users
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield aria-hidden="true" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Growth Rate */}
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Growth</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  +{stats.growth.monthlyGrowth}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.activity.newThisMonth} new clients
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp aria-hidden="true" className="w-6 h-6 text-white" />
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
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search clients"
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {(loadingStates.searching || loadingStates.filtering || isFiltering) && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Filter Button and Active Filters */}
        <div className="flex items-center justify-between mb-4">
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            startContent={<Filter className="w-4 h-4" />}
            onPress={onOpenFilterModal}
          >
            Filters
            {activeFilterCount > 0 && (
              <Chip size="sm" variant="flat" color="primary" className="ml-2">
                {activeFilterCount}
              </Chip>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Chip variant="flat" color="primary" onClose={() => setSearchTerm('')}>
                Search: &ldquo;{searchTerm}&rdquo;
              </Chip>
            )}
            {statusFilter && (
              <Chip variant="flat" color="secondary" onClose={() => setStatusFilter('')}>
                Status: {statusFilter}
              </Chip>
            )}
            {planFilter && (
              <Chip variant="flat" color="success" onClose={() => setPlanFilter('')}>
                Plan: {planFilter}
              </Chip>
            )}
            {accountTypeFilter && (
              <Chip variant="flat" color="warning" onClose={() => setAccountTypeFilter('')}>
                Type: {accountTypeFilter}
              </Chip>
            )}
            {providerFilter && (
              <Chip variant="flat" color="default" onClose={() => setProviderFilter('')}>
                Provider: {providerFilter}
              </Chip>
            )}
            {datePreset !== 'all' && (
              <Chip 
                variant="flat" 
                color="secondary" 
                onClose={() => {
                  setDatePreset('all');
                  setCustomDateFrom('');
                  setCustomDateTo('');
                }}
                className="flex items-center gap-1 max-w-none"
                classNames={{
                  base: "h-auto py-1.5 px-3",
                  content: "flex items-center gap-1.5 text-sm font-medium whitespace-nowrap",
                  closeButton: "ml-2"
                }}
              >
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {datePreset === 'last7' && 'Last 7 days'}
                  {datePreset === 'last30' && 'Last 30 days'}
                  {datePreset === 'last90' && 'Last 90 days'}
                  {datePreset === 'thisMonth' && 'This month'}
                  {datePreset === 'custom' && `${customDateFrom || '...'} to ${customDateTo || '...'}`}
                  <span className="text-xs opacity-75 ml-1">({dateFilterType})</span>
                </span>
              </Chip>
            )}
          </div>
        )}
      </div>

      {/* Clients Table */}
      <Card className="border-0 shadow-lg">
        <CardBody className="p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clients</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} clients total
              </span>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter || planFilter || accountTypeFilter || providerFilter || datePreset !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by adding your first client.'
                }
              </p>
              {!searchTerm && !statusFilter && !planFilter && !accountTypeFilter && !providerFilter && datePreset === 'all' && (
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
                          isLoading={loadingStates.deleting === client.id}
                          isDisabled={loadingStates.deleting === client.id}
                          startContent={loadingStates.deleting === client.id ? null : <Trash2 className="w-4 h-4" />}
                        >
                          {loadingStates.deleting === client.id ? 'Deleting...' : 'Delete'}
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
        <div className="flex flex-col items-center mt-8 space-y-4">
          <UniversalPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          {loadingStates.paginating && (
            <InlineLoading text="Loading page..." size="sm" />
          )}
        </div>
      )}

      {/* Client Form Modal */}
      {isOpen && (formMode === 'create' || (formMode === 'edit' && selectedClient)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <ClientForm
              client={selectedClient || undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
              isLoading={loadingStates.submitting || isSubmitting}
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

      {/* Modern Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={onCloseFilterModal} size="2xl">
        <ModalContent>
          <div className="relative overflow-visible">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
            <div 
              className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
              style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=&apos;40&apos; height=&apos;40&apos; viewBox=&apos;0 0 40 40&apos; xmlns=&apos;http://www.w3.org/2000/svg&apos;%3E%3Cg fill=&apos;%23000000&apos; fill-opacity=&apos;0.05&apos; fill-rule=&apos;evenodd&apos;%3E%3Cpath d=&apos;M0 0h40v40H0V0zm1 1h38v38H1V1z&apos; /%3E%3C/g%3E%3C/svg%3E')"
              }}
            />
            
            {/* Header */}
            <div className="relative z-10 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center shadow-lg">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filter Clients</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Refine your client search with advanced filters</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="relative z-10 px-6 py-6">
              <div className="space-y-8">
                {/* Basic Filters */}
                <div className="space-y-4 relative z-20">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-theme-primary to-theme-accent rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Filters</h3>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                        <Select
                          placeholder="All Statuses"
                          selectedKeys={statusFilter ? [statusFilter] : []}
                          onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || '')}
                          className="w-full"
                          classNames={{
                            trigger: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary",
                          }}
                        >
                          <SelectItem key="" value="">All Statuses</SelectItem>
                          <SelectItem key="active" value="active">Active</SelectItem>
                          <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                          <SelectItem key="suspended" value="suspended">Suspended</SelectItem>
                          <SelectItem key="trial" value="trial">Trial</SelectItem>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</span>
                        <Select
                          placeholder="All Plans"
                          selectedKeys={planFilter ? [planFilter] : []}
                          onSelectionChange={(keys) => setPlanFilter(Array.from(keys)[0] as string || '')}
                          className="w-full"
                          classNames={{
                            trigger: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary",
                          }}
                        >
                          <SelectItem key="free" value="free">Free</SelectItem>
                          <SelectItem key="standard" value="standard">Standard</SelectItem>
                          <SelectItem key="premium" value="premium">Premium</SelectItem>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</span>
                        <Select
                          placeholder="All Types"
                          selectedKeys={accountTypeFilter ? [accountTypeFilter] : []}
                          onSelectionChange={(keys) => setAccountTypeFilter(Array.from(keys)[0] as string || '')}
                          className="w-full"
                          classNames={{
                            trigger: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary",
                          }}
                        >
                          <SelectItem key="individual" value="individual">Individual</SelectItem>
                          <SelectItem key="business" value="business">Business</SelectItem>
                          <SelectItem key="enterprise" value="enterprise">Enterprise</SelectItem>
                        </Select>
                      </div>

                      <div className="space-y-2 relative z-30">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider</span>
                        <Select
                          placeholder="All Providers"
                          selectedKeys={providerFilter ? [providerFilter] : []}
                          onSelectionChange={(keys) => setProviderFilter(Array.from(keys)[0] as string || '')}
                          className="w-full"
                          classNames={{
                            trigger: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary",
                            popover: "z-40",
                            listbox: "z-40",
                          }}
                        >
                          <SelectItem key="credentials" value="credentials">Email/Password</SelectItem>
                          <SelectItem key="google" value="google">Google</SelectItem>
                          <SelectItem key="github" value="github">GitHub</SelectItem>
                          <SelectItem key="facebook" value="facebook">Facebook</SelectItem>
                          <SelectItem key="twitter" value="twitter">Twitter</SelectItem>
                          <SelectItem key="linkedin" value="linkedin">LinkedIn</SelectItem>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Filters - Improved UX */}
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date Range</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      Quick & Easy
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm relative z-10">
                    
                    {/* Apply To Toggle */}
                    <div className="mb-6">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 block">
                        Apply date filter to:
                      </span>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          aria-pressed={dateFilterType === 'created'}
                          onClick={() => setDateFilterType('created')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            dateFilterType === 'created'
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                          )}
                        >
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Created Date
                        </button>
                        <button
                          type="button"
                          aria-pressed={dateFilterType === 'updated'}
                          onClick={() => setDateFilterType('updated')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            dateFilterType === 'updated'
                              ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          )}
                        >
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Updated Date
                        </button>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="mb-6">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 block">
                        Quick filters:
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'all', label: 'All Time', icon: '∞' },
                          { value: 'last7', label: 'Last 7 Days', icon: '7d' },
                          { value: 'last30', label: 'Last 30 Days', icon: '30d' },
                          { value: 'last90', label: 'Last 90 Days', icon: '90d' },
                          { value: 'thisMonth', label: 'This Month', icon: '📅' },
                          { value: 'custom', label: 'Custom Range', icon: '⚙️' },
                        ].map((preset) => (
                          <button
                            type="button"
                            key={preset.value}
                            onClick={() => setDatePreset(preset.value as typeof datePreset)}
                            className={cn(
                              "p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                              "border-2 backdrop-blur-sm relative group overflow-hidden",
                              datePreset === preset.value
                                ? cn(
                                    "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30",
                                    "text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/20"
                                  )
                                : "border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-lg mb-1">{preset.icon}</div>
                                <div className="font-semibold">{preset.label}</div>
                              </div>
                              {datePreset === preset.value && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              )}
                            </div>
                            {datePreset === preset.value && (
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Date Range (Progressive Disclosure) */}
                    {datePreset === 'custom' && (
                      <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Custom Date Range
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="custom-from" className="text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                            <div className="relative group">
                              <Input
                                id="custom-from"
                                type="date"
                                value={customDateFrom}
                                onChange={(e) => setCustomDateFrom(e.target.value)}
                                className="h-12"
                                classNames={{
                                  base: "group-hover:scale-[1.01] transition-transform duration-200",
                                  input: "text-gray-900 dark:text-white text-sm font-medium bg-transparent",
                                  inputWrapper: cn(
                                    "bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/30",
                                    "border-2 border-blue-200/60 dark:border-blue-600/40",
                                    "hover:border-blue-400/60 dark:hover:border-blue-500/60",
                                    "focus-within:border-blue-500 dark:focus-within:border-blue-400",
                                    "focus-within:ring-4 focus-within:ring-blue-500/20",
                                    "rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
                                    "backdrop-blur-sm"
                                  ),
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="custom-to" className="text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                            <div className="relative group">
                              <Input
                                id="custom-to"
                                type="date"
                                value={customDateTo}
                                onChange={(e) => setCustomDateTo(e.target.value)}
                                className="h-12"
                                classNames={{
                                  base: "group-hover:scale-[1.01] transition-transform duration-200",
                                  input: "text-gray-900 dark:text-white text-sm font-medium bg-transparent",
                                  inputWrapper: cn(
                                    "bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/30",
                                    "border-2 border-blue-200/60 dark:border-blue-600/40",
                                    "hover:border-blue-400/60 dark:hover:border-blue-500/60",
                                    "focus-within:border-blue-500 dark:focus-within:border-blue-400",
                                    "focus-within:ring-4 focus-within:ring-blue-500/20",
                                    "rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
                                    "backdrop-blur-sm"
                                  ),
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center justify-between">
                <Button 
                  variant="flat" 
                  onPress={clearFilters}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
                >
                  Clear All
                </Button>
                <div className="flex space-x-3">
                  <Button 
                    variant="flat" 
                    onPress={onCloseFilterModal}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={onCloseFilterModal}
                    className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40 transition-all duration-300 text-white font-medium"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
} 