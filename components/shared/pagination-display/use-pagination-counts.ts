import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { PaginationCounts } from "./types";

interface UsePaginationCountsParams {
  totalCount: number;
  filteredCount: number;
  currentPage: number;
  perPage: number;
  hasActiveFilters: boolean;
  isInfinite: boolean;
}

/**
 * Hook to calculate pagination display counts and text
 *
 * Implements the logic for displaying:
 * - "Showing X items" when no filters are active
 * - "Showing Y of X items" when filters are active
 * - "Showing A-B" for the current page range
 */
export function usePaginationCounts({
  totalCount,
  filteredCount,
  currentPage,
  perPage,
  hasActiveFilters,
  isInfinite,
}: UsePaginationCountsParams): PaginationCounts {
  const t = useTranslations("listing");

  return useMemo(() => {
    const hasResults = filteredCount > 0;
    const start = currentPage * perPage;
    const startDisplay = hasResults ? start + 1 : 0;
    const endDisplay = hasResults
      ? isInfinite
        ? filteredCount
        : Math.min(start + perPage, filteredCount)
      : 0;

    // Count text logic:
    // - No filters: "Showing X items"
    // - With filters: "Showing Y of X items"
    const countText = hasActiveFilters
      ? t("FILTER_STATUS", { filtered: filteredCount, total: totalCount })
      : t("SHOWING_TOTAL_ITEMS", { total: totalCount });

    // Range text: "Showing 1-12"
    const rangeText = hasResults
      ? `${t("SHOWING")} ${startDisplay}-${endDisplay}`
      : `${t("SHOWING")} 0`;

    return {
      start,
      startDisplay,
      endDisplay,
      hasResults,
      countText,
      rangeText,
    };
  }, [totalCount, filteredCount, currentPage, perPage, hasActiveFilters, isInfinite, t]);
}
