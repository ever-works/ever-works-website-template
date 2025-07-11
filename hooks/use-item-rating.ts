"use client";
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
    queryKey: ["itemRating", itemId],
    queryFn: async () => {
      const encodedItemId = encodeURIComponent(itemId);
      const response = await fetch(`/api/items/${encodedItemId}/comments/rating`);
      if (!response.ok) {
        throw new Error("Failed to fetch rating");
      }
      return response.json();
    },
  });

  return {
    rating,
    isLoading,
    error,
  };
} 