/**
 * Cache configuration for Next.js unstable_cache
 * Centralized cache tags and TTL settings
 */

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  /** Content cache duration - 60 seconds */
  CONTENT: 60,
  /** Individual item cache duration - 60 seconds */
  ITEM: 60,
  /** Site config cache duration - 60 seconds */
  CONFIG: 60,
  /** Static pages cache duration - 60 seconds */
  PAGES: 60,
} as const;

/**
 * Cache tags for revalidation
 * Used with revalidateTag() to invalidate specific caches
 */
export const CACHE_TAGS = {
  /** Master content tag - invalidates all content-related caches */
  CONTENT: 'content',

  /** All items collection */
  ITEMS: 'items',

  /** Specific item by slug */
  ITEM: (slug: string) => `item:${slug}`,

  /** All categories */
  CATEGORIES: 'categories',

	/** All tags */
	TAGS: 'tags',

	/** All collections */
	COLLECTIONS: 'collections',

	/** Site configuration */
	CONFIG: 'config',  /** All static pages */
  PAGES: 'pages',

  /** Specific page by slug */
  PAGE: (slug: string) => `page:${slug}`,

  /** Items filtered by locale */
  ITEMS_LOCALE: (locale: string) => `items:${locale}`,

  /** Categories by locale */
  CATEGORIES_LOCALE: (locale: string) => `categories:${locale}`,

	/** Tags by locale */
	TAGS_LOCALE: (locale: string) => `tags:${locale}`,

	/** Collections by locale */
	COLLECTIONS_LOCALE: (locale: string) => `collections:${locale}`,
} as const;