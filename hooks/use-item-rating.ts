"use client";
import { apiUtils, serverClient } from "@/lib/api/server-api-client";
import { useQuery } from "@tanstack/react-query";

interface RatingData {
  averageRating: number;
  totalRatings: number;
}

export function useItemRating(itemId: string, enabled: boolean = true) {
  const {
    data: rating,
    isLoading,
    error,
    refetch,
  } = useQuery<RatingData>({
    queryKey: ["item-rating", itemId],
    queryFn: async ({ signal }) => {
      const encodedItemId = encodeURIComponent(itemId);
      // Avoid HTTP cache; rely on React Query invalidation for freshness
      const response = await serverClient.get<RatingData>(`/api/items/${encodedItemId}/comments/rating`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
        signal,
      });
      if (!apiUtils.isSuccess(response)) {
        throw new Error(apiUtils.getErrorMessage(response) || "Failed to fetch rating");
      }
      return response.data;
    },
    enabled,
    // Provide defined initial data so consumers always have a RatingData shape
    initialData: { averageRating: 0, totalRatings: 0 },
    // Use moderate defaults; mutations and explicit refetch handle immediates
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    rating,
    isLoading,
    error,
    refetch,
  };
} 
