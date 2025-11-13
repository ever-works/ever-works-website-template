import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './cache-config';

/**
 * Invalidates all content-related caches
 * Should be called after repository sync completes successfully
 */
export async function invalidateContentCaches(): Promise<void> {
  console.log('[CACHE] Invalidating all content caches after sync');

  // Invalidate all content-related cache tags
  revalidateTag(CACHE_TAGS.CONTENT);
  revalidateTag(CACHE_TAGS.ITEMS);
  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidateTag(CACHE_TAGS.TAGS);
  revalidateTag(CACHE_TAGS.PAGES);

  console.log('[CACHE] Content caches invalidated successfully');
}

/**
 * Invalidates cache for a specific item
 * @param slug - Item slug to invalidate
 */
export async function invalidateItemCache(slug: string): Promise<void> {
  console.log(`[CACHE] Invalidating cache for item: ${slug}`);
  revalidateTag(CACHE_TAGS.ITEM(slug));
}

/**
 * Invalidates cache for a specific page
 * @param slug - Page slug to invalidate
 */
export async function invalidatePageCache(slug: string): Promise<void> {
  console.log(`[CACHE] Invalidating cache for page: ${slug}`);
  revalidateTag(CACHE_TAGS.PAGE(slug));
}
