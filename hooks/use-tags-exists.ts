import { useQuery } from '@tanstack/react-query';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';

interface TagsExistsResponse {
	exists: boolean;
	count: number;
}

/**
 * Fetch tags existence from API
 */
async function fetchTagsExists(): Promise<TagsExistsResponse> {
	const response = await serverClient.get<TagsExistsResponse>('/api/tags/exists');

	if (!apiUtils.isSuccess(response)) {
		throw new Error(apiUtils.getErrorMessage(response));
	}

	return response.data;
}

/**
 * Custom hook to check if tags exist
 * Uses React Query for caching and state management
 */
export function useTagsExists() {
	return useQuery<TagsExistsResponse, Error>({
		queryKey: ['tags', 'exists'],
		queryFn: fetchTagsExists,
		// Tags change rarely, so we can set a longer staleTime
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
		retry: 1, // Retry once (reduced from 2 to minimize timeout for first-time users)
		retryOnMount: true,
		refetchOnWindowFocus: false, // No need to refetch on window focus
		refetchOnReconnect: true // Refetch if connection comes back
	});
}

