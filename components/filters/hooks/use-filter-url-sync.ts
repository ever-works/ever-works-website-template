import { useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { generateFilterURL, type FilterState } from '@/lib/utils/url-filter-sync';

interface UseFilterURLSyncOptions {
  basePath?: string;
  locale?: string;
  debounceMs?: number;
}

/**
 * Custom hook for synchronizing filter state with URL
 * Handles URL updates when filters change
 *
 * Note: Does not parse from URL to avoid useSearchParams() SSR issues.
 * Initial state should be passed via initialTag/initialCategory props instead.
 */
export function useFilterURLSync(options: UseFilterURLSyncOptions = {}) {
  const { basePath = '/', locale, debounceMs = 300 } = options;
  const router = useRouter();
  const pathname = usePathname();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update URL based on filter state
   * Uses debouncing to avoid excessive history entries
   */
  const updateURL = useCallback(
    (filters: FilterState, immediate = false) => {
      const update = () => {
        const newURL = generateFilterURL(filters, { basePath, locale });

        // Get current full URL (pathname + search)
        let currentFullPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : pathname;

        // Normalize: remove trailing ? if present but no query params
        if (currentFullPath.endsWith('?')) {
          currentFullPath = currentFullPath.slice(0, -1);
        }

        // Normalize: ensure both URLs are comparable
        const normalizedNewURL = newURL.endsWith('?') ? newURL.slice(0, -1) : newURL;
        const normalizedCurrentPath = currentFullPath;

        // Only update if the URL actually changed
        if (normalizedNewURL !== normalizedCurrentPath) {
          console.log('Updating URL from', normalizedCurrentPath, 'to', normalizedNewURL);
          router.push(normalizedNewURL, { scroll: false });
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
    [router, pathname, basePath, locale, debounceMs]
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
    updateURL,
  };
}
