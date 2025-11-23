import { useQuery } from '@tanstack/react-query';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';

interface CategoriesExistsResponse {
  exists: boolean;
  count: number;
}

/**
 * Fetch categories existence from API
 */
async function fetchCategoriesExists(): Promise<CategoriesExistsResponse> {
  const response = await serverClient.get<CategoriesExistsResponse>('/api/categories/exists');
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
}

/**
 * Custom hook to check if categories exist
 * Uses React Query for caching and state management
 */
export function useCategoriesExists() {
  return useQuery<CategoriesExistsResponse, Error>({
    queryKey: ['categories', 'exists'],
    queryFn: fetchCategoriesExists,
    // Categories change rarely, so we can set a longer staleTime
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    retry: 2, // Retry 2 times in case of network error
    retryOnMount: true, // Assume no categories exist on mount to avoid UI issues
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnReconnect: true, // Refetch if connection comes back
    placeholderData: { exists: false, count: 0 }, // Default value if query fails
  });
}
