"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "next-auth";

export const CURRENT_USER_QUERY_KEY = ["auth-session"] as const;
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 30 * 60 * 1000;

interface UseCurrentUserError {
  message: string;
  status?: number;
}

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User, UseCurrentUserError>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await fetch("/api/current-user");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data) {
          throw new Error("No data received from server");
        }
        
        return data;
      } catch (err) {
        const error = err as Error;
        throw {
          message: error.message || "Failed to fetch current user",
          status: error instanceof Response ? error.status : undefined,
        };
      }
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const invalidateUserCache = () => {
    queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
  };

  return {
    user,
    isLoading,
    isError,
    error,
    refetch,
    invalidateUserCache,
  };
}
