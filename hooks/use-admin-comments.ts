import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';

// Types
export interface AdminCommentUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface AdminCommentItem {
  id: string;
  content: string;
  rating: number | null;
  userId: string;
  itemId: string;
  createdAt: string | null;
  updatedAt: string | null;
  user: AdminCommentUser;
}

export interface CommentsListResponse {
  comments: AdminCommentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommentsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Query keys for React Query
const commentsQueryKeys = {
  all: ['admin-comments'] as const,
  lists: () => [...commentsQueryKeys.all, 'list'] as const,
  list: (params: CommentsListParams) => [...commentsQueryKeys.lists(), params] as const,
  details: () => [...commentsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...commentsQueryKeys.details(), id] as const,
};

// API functions
const fetchComments = async (params: CommentsListParams): Promise<CommentsListResponse> => {
  const queryString = apiUtils.createQueryString({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '10',
    ...(params.search && { search: params.search }),
  });
  
  const response = await serverClient.get<CommentsListResponse>(`/api/admin/comments?${queryString}`);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
};

const deleteComment = async (id: string): Promise<void> => {
  const response = await serverClient.delete(`/api/admin/comments/${id}`);
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
};

interface UseAdminCommentsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

interface UseAdminCommentsReturn {
  // Data
  comments: AdminCommentItem[];
  
  // Loading states
  isLoading: boolean;
  isFiltering: boolean;
  isDeleting: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalComments: number;
  
  // Search
  searchTerm: string;
  
  // Actions
  deleteComment: (id: string) => Promise<boolean>;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  handlePageChange: (page: number) => void;
  
  // Search actions
  setSearchTerm: (term: string) => void;
  handleSearch: (term: string) => void;
  
  // Utility
  refetch: () => void;
  refreshData: () => void;
}

export function useAdminComments(options: UseAdminCommentsOptions = {}): UseAdminCommentsReturn {
  const {
    page: initialPage = 1,
    limit = 10,
    search: initialSearch = '',
  } = options;

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Query client for cache management
  const queryClient = useQueryClient();

  // React Query hooks
  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: commentsQueryKeys.list({ 
      page: currentPage, 
      limit, 
      search: searchTerm || undefined 
    }),
    queryFn: () => fetchComments({ 
      page: currentPage, 
      limit, 
      search: searchTerm || undefined 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKeys.all });
      toast.success('Comment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });

  // Derived data
  const comments = commentsData?.comments || [];
  const isFiltering = isLoading && currentPage === 1;
  const totalPages = commentsData?.totalPages || 1;
  const totalComments = commentsData?.total || 0;

  // Wrapper function for delete
  const handleDeleteComment = useCallback(async (id: string): Promise<boolean> => {
    if (!id) return false;
    
    try {
      setIsDeleting(id);
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return false;
    } finally {
      setIsDeleting(null);
    }
  }, [deleteMutation]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Refresh all data
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: commentsQueryKeys.all });
  }, [queryClient]);

  return {
    // Data
    comments,
    
    // Loading states
    isLoading,
    isFiltering,
    isDeleting,
    
    // Pagination
    currentPage,
    totalPages,
    totalComments,
    
    // Search
    searchTerm,
    
    // Actions
    deleteComment: handleDeleteComment,
    
    // Pagination actions
    setCurrentPage,
    handlePageChange,
    
    // Search actions
    setSearchTerm,
    handleSearch,
    
    // Utility
    refetch,
    refreshData,
  };
}
