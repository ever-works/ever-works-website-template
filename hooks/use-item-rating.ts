"use client";
import { apiUtils, serverClient } from "@/lib/api/server-api-client";
import { useQuery } from "@tanstack/react-query";

interface RatingData {
  averageRating: number;
  totalRatings: number;
}

export function useItemRating(itemId: string, enabled: boolean = true) {
  const {
    data: rating = { averageRating: 0, totalRatings: 0 },
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
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    rating,
    isLoading,
    error,
    refetch,
  };
} 
