import { useQuery } from '@tanstack/react-query';
import { serverClient } from '@/lib/server-client';
import type { FeatureFlags } from '@/lib/config/feature-flags';

/**
 * Result type for useFeatureFlags hook
 */
interface UseFeatureFlagsResult {
  /** Feature availability flags */
  features: FeatureFlags;
  /** Whether flags are currently loading */
  isLoading: boolean;
  /** Error if flag fetch failed */
  error: Error | null;
  /** Function to manually refetch flags */
  refetch: () => void;
}

/**
 * Fetch feature flags from API
 */
async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const response = await serverClient.get<FeatureFlags>('/api/config/features');
  return response.data;
}

/**
 * Hook to access feature flags in client components
 *
 * Fetches and caches feature availability flags from the server.
 * Features are automatically disabled if the fetch fails for safety.
 *
 * @returns {UseFeatureFlagsResult} Feature flags and loading state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { features, isLoading } = useFeatureFlags();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!features.comments) return null;
 *
 *   return <CommentsSection />;
 * }
 * ```
 */
export function useFeatureFlags(): UseFeatureFlagsResult {
  const { data, isLoading, error, refetch } = useQuery<FeatureFlags, Error>({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
    // On error, disable all features for safety
    placeholderData: {
      ratings: false,
      comments: false,
      favorites: false,
      featuredItems: false,
    },
  });

  return {
    features: data || {
      ratings: false,
      comments: false,
      favorites: false,
      featuredItems: false,
    },
    isLoading,
    error: error || null,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * Hook to check if a specific feature is enabled
 *
 * @param {keyof FeatureFlags} featureName - Name of the feature to check
 * @returns {object} Object with enabled boolean and loading state
 *
 * @example
 * ```tsx
 * function FavoriteButton() {
 *   const { enabled, isLoading } = useFeatureEnabled('favorites');
 *
 *   if (isLoading || !enabled) return null;
 *
 *   return <button>Add to Favorites</button>;
 * }
 * ```
 */
export function useFeatureEnabled(featureName: keyof FeatureFlags): {
  enabled: boolean;
  isLoading: boolean;
} {
  const { features, isLoading } = useFeatureFlags();

  return {
    enabled: features[featureName],
    isLoading,
  };
}
