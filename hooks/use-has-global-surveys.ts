import { useQuery } from '@tanstack/react-query';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import { SurveyTypeEnum, SurveyStatusEnum } from '@/lib/types/survey';
import { useFeatureFlagsWithSimulation } from './use-feature-flags-with-simulation';

/**
 * Result type for useHasGlobalSurveys hook
 */
interface UseHasGlobalSurveysResult {
  /** Whether there are published global surveys */
  hasGlobalSurveys: boolean;
  /** Whether the check is currently loading */
  isPending: boolean;
  /** Error if the check failed */
  error: Error | null;
  /** Function to manually refetch */
  refetch: () => void;
}

/**
 * Fetch global published surveys count
 */
async function checkGlobalSurveys(): Promise<boolean> {
  try {
    const result = await surveyApiClient.getMany({
      type: SurveyTypeEnum.GLOBAL,
      status: SurveyStatusEnum.PUBLISHED,
      limit: 1, // We only need to know if at least one exists
    });
    return (result.surveys?.length || 0) > 0;
  } catch (error) {
    // If there's an error, assume no surveys to be safe
    return false;
  }
}

/**
 * Hook to check if there are any published global surveys
 * @returns {UseHasGlobalSurveysResult} Whether global surveys exist and loading state
 */
export function useHasGlobalSurveys(): UseHasGlobalSurveysResult {
  const { features } = useFeatureFlagsWithSimulation();

  const { data, isPending, error, refetch } = useQuery<boolean, Error>({
    queryKey: ['has-global-surveys'],
    queryFn: checkGlobalSurveys,
    enabled: features.surveys, // Only fetch when surveys feature is enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry if database is unavailable
      if (error?.message?.includes('Database not configured')) {
        return false;
      }
      // Otherwise retry once (reduced from 2 to minimize timeouts)
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  return {
    hasGlobalSurveys: data || false,
    isPending,
    error: error || null,
    refetch: () => {
      refetch();
    },
  };
}

