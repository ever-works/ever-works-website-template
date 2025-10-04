import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';
import { ItemData, CreateItemRequest, UpdateItemRequest } from '@/lib/types/item';

export interface ItemsListResponse {
  items: ItemData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ItemsListParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

export interface ItemStatsResponse {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ReviewItemRequest {
  status: 'approved' | 'rejected';
  review_notes?: string;
}

// Query keys
const QUERY_KEYS = {
  items: ['admin', 'items'] as const,
  itemsList: (params: ItemsListParams) => [...QUERY_KEYS.items, 'list', params] as const,
  itemStats: () => [...QUERY_KEYS.items, 'stats'] as const,
} as const;

// API functions
const fetchItems = async (params: ItemsListParams = {}): Promise<ItemsListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.status) searchParams.set('status', params.status);
  if (params.category) searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);

  const response = await serverClient.get<ItemsListResponse>(`/api/admin/items?${searchParams.toString()}`);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
};

const fetchItemStats = async (): Promise<ItemStatsResponse> => {
  const response = await serverClient.get<{ success: boolean; data: ItemStatsResponse }>('/api/admin/items/stats');
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data.data;
};

const createItem = async (data: CreateItemRequest): Promise<ItemsListResponse> => {
  const response = await serverClient.post<ItemsListResponse>('/api/admin/items', data);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
};

const updateItem = async (id: string, data: UpdateItemRequest): Promise<ItemsListResponse> => {
  const response = await serverClient.put<ItemsListResponse>(`/api/admin/items/${id}`, data);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
};

const deleteItem = async (id: string): Promise<void> => {
  const response = await serverClient.delete(`/api/admin/items/${id}`);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
};

const reviewItem = async (id: string, data: ReviewItemRequest): Promise<ItemsListResponse> => {
  const response = await serverClient.post<ItemsListResponse>(`/api/admin/items/${id}/review`, data);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
};

// Hook
export function useAdminItems(params: ItemsListParams = {}) {
  const queryClient = useQueryClient();

  // Fetch items
  const {
    data: itemsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.itemsList(params),
    queryFn: () => fetchItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes - reduced from 30 seconds
    retry: 3,
  });

  // Fetch stats
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.itemStats(),
    queryFn: fetchItemStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: createItem,
    onSuccess: (data) => {
      toast.success(data.message || 'Item created successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create item');
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemRequest }) => updateItem(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Item updated successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      toast.success('Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });

  // Review item mutation
  const reviewItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewItemRequest }) => reviewItem(id, data),
    onSuccess: (data) => {
      toast.success(`Item ${data.message || 'reviewed successfully'}`);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to review item');
    },
  });

  // Handlers
  const handleCreateItem = useCallback(async (data: CreateItemRequest): Promise<boolean> => {
    try {
      await createItemMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }, [createItemMutation]);

  const handleUpdateItem = useCallback(async (id: string, data: UpdateItemRequest): Promise<boolean> => {
    try {
      await updateItemMutation.mutateAsync({ id, data });
      return true;
    } catch {
      return false;
    }
  }, [updateItemMutation]);

  const handleDeleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteItemMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  }, [deleteItemMutation]);

  const handleReviewItem = useCallback(async (id: string, status: 'approved' | 'rejected', notes?: string): Promise<boolean> => {
    try {
      await reviewItemMutation.mutateAsync({ id, data: { status, review_notes: notes } });
      return true;
    } catch {
      return false;
    }
  }, [reviewItemMutation]);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items });
  }, [queryClient]);

  return {
    // Data
    items: itemsData?.items || [],
    total: itemsData?.total || 0,
    page: itemsData?.page || 1,
    totalPages: itemsData?.totalPages || 1,
    stats: stats || {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    
    // Loading states
    isLoading,
    isStatsLoading,
    isSubmitting: createItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending || reviewItemMutation.isPending,
    
    // Actions
    createItem: handleCreateItem,
    updateItem: handleUpdateItem,
    deleteItem: handleDeleteItem,
    reviewItem: handleReviewItem,
    
    // Utility
    refetch,
    refreshData,
  };
}
