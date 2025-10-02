import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';
import {
  TagData,
  TagWithCount,
  CreateTagRequest,
  UpdateTagRequest,
  TagListResponse,
  TagListOptions
} from '@/lib/types/tag';

// Query keys factory
const QUERY_KEYS = {
  tags: ['admin', 'tags'] as const,
  tagsAll: () => [...QUERY_KEYS.tags, 'all'] as const,
  tagsList: (params: TagListOptions) => [...QUERY_KEYS.tags, 'list', params] as const,
  tag: (id: string) => [...QUERY_KEYS.tags, 'detail', id] as const,
} as const;

// API functions
const fetchTags = async (params: TagListOptions = {}): Promise<TagListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.includeInactive) searchParams.set('includeInactive', 'true');
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await serverClient.get<TagListResponse>(`/api/admin/tags?${searchParams.toString()}`);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
};

const fetchTag = async (id: string): Promise<TagData> => {
  const response = await serverClient.get<{ success: boolean; tag: TagData }>(`/api/admin/tags/${id}`);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data.tag;
};

const fetchTagsAll = async (): Promise<TagListResponse> => {
  const response = await serverClient.get<TagListResponse>('/api/admin/tags/all');
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  return response.data;
};

const createTag = async (data: CreateTagRequest): Promise<TagData> => {
  const response = await serverClient.post<{ success: boolean; tag: TagData }>('/api/admin/tags', data);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data.tag;
};

const updateTag = async (id: string, data: UpdateTagRequest): Promise<TagData> => {
  const response = await serverClient.put<{ success: boolean; tag: TagData }>(`/api/admin/tags/${id}`, data);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data.tag;
};

const deleteTag = async (id: string, hard = false): Promise<void> => {
  const url = hard ? `/api/admin/tags/${id}?hard=true` : `/api/admin/tags/${id}`;
  const response = await serverClient.delete(url);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
};

// Hook interface
export interface UseAdminTagsOptions {
  params?: TagListOptions;
  enabled?: boolean;
}

export interface UseAdminTagsReturn {
  // Data
  tags: TagWithCount[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: Error | null;
  
  // Actions
  createTag: (data: CreateTagRequest) => Promise<boolean>;
  updateTag: (id: string, data: UpdateTagRequest) => Promise<boolean>;
  deleteTag: (id: string, hard?: boolean) => Promise<boolean>;
  tagsAll: () => Promise<TagListResponse | null>;
  // Utility
  refetch: () => void;
  refreshData: () => void;
}

// Main hook
export function useAdminTags(options: UseAdminTagsOptions = {}): UseAdminTagsReturn {
  const { params = {}, enabled = true } = options;
  const queryClient = useQueryClient();

  // Fetch tags list
  const {
    data: tagsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.tagsList(params),
    queryFn: () => fetchTags(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: (data) => {
      toast.success('Tag created successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create tag');
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) => updateTag(id, data),
    onSuccess: (data) => {
      toast.success('Tag updated successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update tag');
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) => deleteTag(id, hard),
    onSuccess: () => {
      toast.success('Tag deleted successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete tag');
    },
  });

  // Tags all mutation
  const tagsAllMutation = useMutation({
    mutationFn: fetchTagsAll,
    onSuccess: () => {
      toast.success('Tags fetched successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tagsAll() });
    },
  });

  // Action handlers
  const handleCreateTag = useCallback(async (data: CreateTagRequest): Promise<boolean> => {
    try {
      await createTagMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }, [createTagMutation]);

  const handleUpdateTag = useCallback(async (id: string, data: UpdateTagRequest): Promise<boolean> => {
    try {
      await updateTagMutation.mutateAsync({ id, data });
      return true;
    } catch {
      return false;
    }
  }, [updateTagMutation]);

  const handleDeleteTag = useCallback(async (id: string, hard = false): Promise<boolean> => {
    try {
      await deleteTagMutation.mutateAsync({ id, hard });
      return true;
    } catch {
      return false;
    }
  }, [deleteTagMutation]);

  const handleTagsAll = useCallback(async (): Promise<TagListResponse | null> => {
    try {
      const result = await tagsAllMutation.mutateAsync();
      return result;
    } catch {
      return null;
    }
  }, [tagsAllMutation]);


  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
  }, [queryClient]);

  return {
    // Data
    tags: tagsData?.tags || [],
    total: tagsData?.total || 0,
    page: tagsData?.page || 1,
    totalPages: tagsData?.totalPages || 1,
    limit: tagsData?.limit || 10,
    
    // Loading states
    isLoading,
    isSubmitting: createTagMutation.isPending || updateTagMutation.isPending || deleteTagMutation.isPending,
    error: error as Error | null,
    
    // Actions
    createTag: handleCreateTag,
    updateTag: handleUpdateTag,
    deleteTag: handleDeleteTag,
    tagsAll: handleTagsAll,
    
    // Utility
    refetch,
    refreshData,
  };
}

// Hook for single tag
export interface UseTagOptions {
  id: string;
  enabled?: boolean;
}

export interface UseTagReturn {
  tag: TagData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTag({ id, enabled = true }: UseTagOptions): UseTagReturn {
  const {
    data: tag,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.tag(id),
    queryFn: () => fetchTag(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  });

  return {
    tag: tag || null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// Hook for tag mutations only
export interface UseTagMutationsReturn {
  createTag: (data: CreateTagRequest) => Promise<boolean>;
  updateTag: (id: string, data: UpdateTagRequest) => Promise<boolean>;
  deleteTag: (id: string, hard?: boolean) => Promise<boolean>;
  isSubmitting: boolean;
}

export function useTagMutations(): UseTagMutationsReturn {
  const queryClient = useQueryClient();

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      toast.success('Tag created successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create tag');
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) => updateTag(id, data),
    onSuccess: () => {
      toast.success('Tag updated successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update tag');
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) => deleteTag(id, hard),
    onSuccess: () => {
      toast.success('Tag deleted successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete tag');
    },
  });

  const handleCreateTag = useCallback(async (data: CreateTagRequest): Promise<boolean> => {
    try {
      await createTagMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }, [createTagMutation]);

  const handleUpdateTag = useCallback(async (id: string, data: UpdateTagRequest): Promise<boolean> => {
    try {
      await updateTagMutation.mutateAsync({ id, data });
      return true;
    } catch {
      return false;
    }
  }, [updateTagMutation]);

  const handleDeleteTag = useCallback(async (id: string, hard = false): Promise<boolean> => {
    try {
      await deleteTagMutation.mutateAsync({ id, hard });
      return true;
    } catch {
      return false;
    }
  }, [deleteTagMutation]);

  return {
    createTag: handleCreateTag,
    updateTag: handleUpdateTag,
    deleteTag: handleDeleteTag,
    isSubmitting: createTagMutation.isPending || updateTagMutation.isPending || deleteTagMutation.isPending,
  };
}

// Hook for tags all (dedicated hook for /api/admin/tags/all)
export interface UseTagsAllOptions {
  locale?: string;
  enabled?: boolean;
}

export interface UseTagsAllReturn {
  tags: TagWithCount[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}



// Legacy hooks for backward compatibility
export const useTags = useAdminTags;
export const useCreateTag = () => useTagMutations().createTag;
export const useUpdateTag = () => useTagMutations().updateTag;
export const useDeleteTag = () => useTagMutations().deleteTag;
export const useTagManagement = useTagMutations;