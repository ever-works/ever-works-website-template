import { useQuery } from '@tanstack/react-query';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';

interface CollectionsExistsResponse {
  exists: boolean;
  count: number;
}

/**
 * Fetch collections existence from API
 */
async function fetchCollectionsExists(): Promise<CollectionsExistsResponse> {
  const response = await serverClient.get<CollectionsExistsResponse>('/api/collections/exists');
  
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  
  return response.data;
}

/**
 * Custom hook to check if collections exist
 * Uses React Query for caching and state management
 */
export function useCollectionsExists() {
  return useQuery<CollectionsExistsResponse, Error>({
    queryKey: ['collections', 'exists'],
    queryFn: fetchCollectionsExists,
    // Collections change rarely, so we can set a longer staleTime
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    retry: 1, // Retry once (reduced from 2 to minimize timeout for first-time users)
    retryOnMount: true,
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnReconnect: true, // Refetch if connection comes back
  });
}

