import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './cache-config';

/**
 * Safely call revalidateTag with error handling
 * Catches errors when called during render phase and logs warning
 * @param tag - Cache tag to revalidate
 */
function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag);
  } catch (error) {
    // revalidateTag throws error when called during render phase
    // This is expected when background sync runs during request handling
    // Cache will be invalidated on next sync outside of render phase
    if (error instanceof Error && error.message.includes('during render')) {
      console.warn(`[CACHE] Skipping cache invalidation during render phase (tag: ${tag})`);
    } else {
      // Re-throw unexpected errors
      throw error;
    }
  }
}

/**
 * Invalidates all content-related caches
 * Should be called after repository sync completes successfully
 */
export async function invalidateContentCaches(): Promise<void> {
  console.log('[CACHE] Invalidating all content caches after sync');

  // Invalidate all content-related cache tags
  // Using safe wrapper to handle render phase restrictions
  safeRevalidateTag(CACHE_TAGS.CONTENT);
  safeRevalidateTag(CACHE_TAGS.ITEMS);
  safeRevalidateTag(CACHE_TAGS.CATEGORIES);
  safeRevalidateTag(CACHE_TAGS.TAGS);
  safeRevalidateTag(CACHE_TAGS.PAGES);

  console.log('[CACHE] Content caches invalidated successfully');
}

/**
 * Invalidates cache for a specific item
 * @param slug - Item slug to invalidate
 */
export async function invalidateItemCache(slug: string): Promise<void> {
  console.log(`[CACHE] Invalidating cache for item: ${slug}`);
  safeRevalidateTag(CACHE_TAGS.ITEM(slug));
}

/**
 * Invalidates cache for a specific page
 * @param slug - Page slug to invalidate
 */
export async function invalidatePageCache(slug: string): Promise<void> {
  console.log(`[CACHE] Invalidating cache for page: ${slug}`);
  safeRevalidateTag(CACHE_TAGS.PAGE(slug));
}
