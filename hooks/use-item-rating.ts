"use client";
import { apiUtils, serverClient } from "@/lib/api/server-api-client";
import { useQuery } from "@tanstack/react-query";

interface RatingData {
  averageRating: number;
  totalRatings: number;
}

export function useItemRating(itemId: string) {
  const {
    data: rating = { averageRating: 0, totalRatings: 0 },
    isLoading,
    error,
  } = useQuery<RatingData>({
    queryKey: ["item-rating", itemId],
    queryFn: async () => {
      const encodedItemId = encodeURIComponent(itemId);
      const response = await serverClient.get<RatingData>(`/api/items/${encodedItemId}/comments/rating`);
      if (!apiUtils.isSuccess(response)) {
        throw new Error(apiUtils.getErrorMessage(response) || "Failed to fetch rating");
      }
      return response.data;
    },
  });

  return {
    rating,
    isLoading,
    error,
  };
} 