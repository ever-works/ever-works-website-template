import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  featuredAt: string;
}

interface FeaturedItemsResponse {
  success: boolean;
  data: FeaturedItem[];
  count: number;
}

interface UseFeaturedItemsSectionProps {
  limit?: number;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}

export const featuredItemsQueryKeys = {
  all: ['featured-items'] as const,
  lists: () => [...featuredItemsQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...featuredItemsQueryKeys.lists(), { filters }] as const,
  details: () => [...featuredItemsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...featuredItemsQueryKeys.details(), id] as const,
};

const fetchFeaturedItems = async (limit: number): Promise<FeaturedItem[]> => {
  const response = await serverClient.get<FeaturedItemsResponse>(`/api/featured-items?limit=${limit}`);
  
  if (!apiUtils.isSuccess(response)) {
    const errorMessage = apiUtils.getErrorMessage(response) || 'Failed to fetch featured items';
    throw new Error(errorMessage);
  }

  return response.data.data;
};

export function useFeaturedItemsSection({
  limit = 6,
  enabled = true,
  staleTime = 5 * 60 * 1000, 
  refetchInterval = 10 * 60 * 1000, 
}: UseFeaturedItemsSectionProps = {}) {
  const queryClient = useQueryClient();

  const {
    data: featuredItems = [],
    isLoading,
    isError,
    error,
    refetch,
    isStale,
    dataUpdatedAt,
  } = useQuery({
    queryKey: featuredItemsQueryKeys.list({ limit }),
    queryFn: () => fetchFeaturedItems(limit),
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const invalidateFeaturedItems = () => {
    return queryClient.invalidateQueries({
      queryKey: featuredItemsQueryKeys.all,
    });
  };

  const prefetchFeaturedItems = (newLimit: number) => {
    return queryClient.prefetchQuery({
      queryKey: featuredItemsQueryKeys.list({ limit: newLimit }),
      queryFn: () => fetchFeaturedItems(newLimit),
      staleTime,
    });
  };

  return {
    featuredItems,
    isLoading,
    isError,
    error: error?.message || null,
    refetch,
    invalidateFeaturedItems,
    prefetchFeaturedItems,
    isStale,
    dataUpdatedAt,
  };
}