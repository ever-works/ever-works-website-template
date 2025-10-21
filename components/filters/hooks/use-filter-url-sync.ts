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
        // IMPORTANT: Use window.location to get the ACTUAL browser URL
        let currentFullPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : pathname;

        console.log('[use-filter-url-sync] ===== UPDATE URL =====');
        console.log('[use-filter-url-sync] Current browser URL:', currentFullPath);
        console.log('[use-filter-url-sync] Generated new URL:', newURL);
        console.log('[use-filter-url-sync] Locale:', locale);

        // Normalize URLs for comparison
        const normalize = (url: string) => {
          let normalized = url;

          // Remove trailing ? if present
          if (normalized.endsWith('?')) {
            normalized = normalized.slice(0, -1);
          }

          // Remove locale prefix for comparison (e.g., /en/tags/foo -> /tags/foo)
          if (locale && normalized.startsWith(`/${locale}/`)) {
            normalized = normalized.substring(locale.length + 1);
          } else if (locale && normalized === `/${locale}`) {
            normalized = '/';
          }

          return normalized;
        };

        const normalizedNewURL = normalize(newURL);
        const normalizedCurrentPath = normalize(currentFullPath);

        console.log('[use-filter-url-sync] Normalized current:', normalizedCurrentPath);
        console.log('[use-filter-url-sync] Normalized new:', normalizedNewURL);
        console.log('[use-filter-url-sync] Are they equal?', normalizedNewURL === normalizedCurrentPath);

        // Only update if the URL actually changed
        if (normalizedNewURL !== normalizedCurrentPath) {
          console.log('⚠️ Updating URL from', normalizedCurrentPath, 'to', normalizedNewURL);
          console.log('⚠️ Calling router.push with:', newURL);

          try {
            router.push(newURL, { scroll: false });
            console.log('✅ router.push called successfully');
          } catch (error) {
            console.error('❌ router.push failed:', error);
          }
        } else {
          console.log('[use-filter-url-sync] URLs are the same, skipping update');
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
          console.log('[use-filter-url-sync] Clearing previous debounce timer');
          clearTimeout(debounceTimerRef.current);
        }
        console.log('[use-filter-url-sync] Setting debounce timer for', debounceMs, 'ms');
        debounceTimerRef.current = setTimeout(() => {
          console.log('[use-filter-url-sync] Debounce timer fired, executing update');
          update();
        }, debounceMs);
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
