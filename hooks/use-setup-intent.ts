import { apiUtils, serverClient } from "@/lib/api/server-api-client";
import { SetupIntent } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";

export const SETUP_INTENT_QUERY_KEY = ['stripe', 'setup-intent'] as const;

const getSetupIntent = async (): Promise<SetupIntent> => {
  const response = await serverClient.post<SetupIntent>('/api/stripe/setup-intent');
  if (!apiUtils.isSuccess(response)) {
    throw new Error(apiUtils.getErrorMessage(response));
  }
  return response.data;
};

export const useSetupIntent = (options?: {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
}) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    cacheTime = 10 * 60 * 1000,
    retry = 2,
    retryDelay = 1000,
  } = options || {};

  const { data, isLoading, error, refetch, isError, isFetching } = useQuery({
    queryKey: SETUP_INTENT_QUERY_KEY,
    queryFn: getSetupIntent,
    enabled,
    staleTime,
    gcTime: cacheTime, 
    retry,
    retryDelay,
    meta: {
      sensitive: true,
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
    hasSetupIntent: Boolean(data?.id),
  };
};