"use client";

import { useState, useCallback } from "react";
import { useLayoutTheme } from "@/components/context";
import { ItemData } from "@/lib/content";
import { PER_PAGE } from "@/lib/paginate";

interface UseInfiniteLoadingProps {
  items: ItemData[];
  initialPage: number;
  perPage?: number;
}

interface UseInfiniteLoadingResult {
  displayedItems: ItemData[];
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
}

export function useInfiniteLoading({
  items,
  initialPage,
  perPage = PER_PAGE,
}: UseInfiniteLoadingProps): UseInfiniteLoadingResult {
  const { paginationType } = useLayoutTheme();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const totalPages = Math.ceil(items.length / perPage);
  const displayedItems = items.slice(0, currentPage * perPage);
  const hasMore = currentPage < totalPages && displayedItems.length < items.length;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || paginationType !== "infinite") return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more items"));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, paginationType]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    error,
    loadMore,
  };
} 