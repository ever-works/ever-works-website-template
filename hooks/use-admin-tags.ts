import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TagData } from '@/lib/types/tag';
import { apiUtils, serverClient } from '@/lib/api/server-api-client';

// Create server client instance

// Types
export interface TagsResponse {
  tags: TagData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
  message?: string;
  error?: string;
}


export interface UpdateTagData extends TagData {}

// Query keys
export const tagsKeys = {
  all: ['tags'] as const,
  lists: () => [...tagsKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...tagsKeys.lists(), { page, limit }] as const,
  details: () => [...tagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagsKeys.details(), id] as const,
};

// API functions
const tagsApi = {
  // Get tags with pagination
  getTags: async (page: number = 1, limit: number = 10): Promise<TagsResponse> => {
    const response = await serverClient.get<TagsResponse>(`/api/admin/tags?page=${page}&limit=${limit}`);
    
    if (!apiUtils.isSuccess(response)) {
      throw new Error(response.error || 'Failed to fetch tags');
    }
    
    return response.data;
  },

  // Create tag
  createTag: async (data: TagData): Promise<TagsResponse> => {
    const response = await serverClient.post<TagsResponse>('/api/admin/tags', data);
    
    if (!apiUtils.isSuccess(response)) {
      throw new Error(response.error || 'Failed to create tag');
    }
    
    return response.data;
  },

  // Update tag
  updateTag: async (id: string, data: UpdateTagData): Promise<TagsResponse> => {
    const response = await serverClient.put<TagsResponse>(`/api/admin/tags/${id}`, data);
    
    if (!apiUtils.isSuccess(response)) {
      throw new Error(response.error || 'Failed to update tag');
    }
    
    return response.data;
  },

  // Delete tag
  deleteTag: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await serverClient.delete<{ success: boolean; message?: string }>(`/api/admin/tags/${id}`);
    
    if (!apiUtils.isSuccess(response)) {
      throw new Error(response.error || 'Failed to delete tag');
    }
    
    return response.data;
  },
};

// Custom hooks
export function useTags(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: tagsKeys.list(page, limit),
    queryFn: () => tagsApi.getTags(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.createTag,
    onSuccess: (data) => {
      // Invalidate and refetch tags lists
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      
      // Optionally add the new tag to the cache
      if (data.tags && data.tags.length > 0) {
        queryClient.setQueryData(tagsKeys.detail(data.tags[0].id), data.tags[0]);
      }
    },
    onError: (error) => {
      console.error('Error creating tag:', error);
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagData }) => 
      tagsApi.updateTag(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch tags lists
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      
      // Update the specific tag in cache
      if (data.tags && data.tags.length > 0) {
        queryClient.setQueryData(tagsKeys.detail(variables.id), data.tags[0]);
      }
    },
    onError: (error) => {
      console.error('Error updating tag:', error);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.deleteTag,
    onSuccess: (_, tagId) => {
      // Invalidate and refetch tags lists
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      
      // Remove the tag from cache
      queryClient.removeQueries({ queryKey: tagsKeys.detail(tagId) });
    },
    onError: (error) => {
      console.error('Error deleting tag:', error);
    },
  });
}

// Utility hook for tag management
export function useTagManagement() {
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const createTag = async (data: TagData) => {
    return createTagMutation.mutateAsync(data);
  };

  const updateTag = async (id: string, data: UpdateTagData) => {
    return updateTagMutation.mutateAsync({ id, data });
  };

  const deleteTag = async (id: string) => {
    return deleteTagMutation.mutateAsync(id);
  };

  return {
    createTag,
    updateTag,
    deleteTag,
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
    createError: createTagMutation.error,
    updateError: updateTagMutation.error,
    deleteError: deleteTagMutation.error,
  };
}
