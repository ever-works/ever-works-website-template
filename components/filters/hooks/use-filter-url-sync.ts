import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { generateFilterURL, parseFilterFromSearchParams, type FilterState } from '@/lib/utils/url-filter-sync';

interface UseFilterURLSyncOptions {
  basePath?: string;
  locale?: string;
  debounceMs?: number;
}

/**
 * Custom hook for synchronizing filter state with URL
 * Handles URL updates when filters change and parses initial state from URL
 */
export function useFilterURLSync(options: UseFilterURLSyncOptions = {}) {
  const { basePath = '/', locale, debounceMs = 300 } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Parse current filter state from URL
   */
  const parseFiltersFromURL = useCallback((): FilterState => {
    return parseFilterFromSearchParams(searchParams);
  }, [searchParams]);

  /**
   * Update URL based on filter state
   * Uses debouncing to avoid excessive history entries
   */
  const updateURL = useCallback(
    (filters: FilterState, immediate = false) => {
      const update = () => {
        const newURL = generateFilterURL(filters, { basePath, locale });

        // Only update if the URL actually changed
        const currentURL = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        if (newURL !== currentURL) {
          router.push(newURL, { scroll: false });
        }
      };

      if (immediate) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        update();
      } else {
        // Debounce URL updates to avoid creating too many history entries
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(update, debounceMs);
      }
    },
    [router, pathname, searchParams, basePath, locale, debounceMs]
  );

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    parseFiltersFromURL,
    updateURL,
  };
}
