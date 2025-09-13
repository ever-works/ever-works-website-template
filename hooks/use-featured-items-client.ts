import { useQuery } from '@tanstack/react-query';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';

export interface FeaturedItem {
  id: string;
  itemSlug: string;
  itemName: string;
  itemIconUrl?: string;
  itemCategory?: string;
  itemDescription?: string;
  featuredOrder: number;
  featuredUntil?: string;
  isActive: boolean;
  featuredBy: string;
  featuredAt: string;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedItemsResponse {
  success: boolean;
  data: FeaturedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query keys for React Query
const featuredItemsQueryKeys = {
  all: ['featured-items-client'] as const,
  lists: () => [...featuredItemsQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...featuredItemsQueryKeys.lists(), filters] as const,
};

// API function
const fetchFeaturedItems = async (): Promise<FeaturedItem[]> => {
  const response = await serverClient.get<FeaturedItemsResponse>('/api/featured-items');
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data.data;
};

export function useFeaturedItems() {
  const {
    data: featuredItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: featuredItemsQueryKeys.list({}),
    queryFn: async () => {
      const response = await fetchFeaturedItems();
      console.log('response',response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });

  return {
    featuredItems,
    isLoading,
    error,
    refetch,
  };
}
