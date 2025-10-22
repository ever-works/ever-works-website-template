/**
 * URL Filter Synchronization Utilities
 *
 * Handles URL generation and parsing for tag and category filters.
 * Supports both clean URLs (/tags/slug) and query parameters (?tags=a,b&categories=x,y)
 */

export interface FilterState {
  tags: string[];
  categories: string[];
}

export interface URLFilterOptions {
  basePath?: string;
  locale?: string;
}

/**
 * Encode a filter value for use in URLs
 * Handles special characters and spaces
 */
function encodeFilterValue(value: string): string {
  return encodeURIComponent(value.toLowerCase().trim());
}

/**
 * Decode a filter value from URL
 */
function decodeFilterValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    console.error('Error decoding filter value:', error);
    return value;
  }
}

/**
 * Generate URL based on current filter state
 *
 * Rules:
 * - Single tag, no categories: /tags/[tag-slug]
 * - Single category, no tags: /categories/[category-slug]
 * - Multiple tags or categories: /?tags=a,b&categories=x,y
 * - No filters: base path (/)
 */
export function generateFilterURL(
  filters: FilterState,
  options: URLFilterOptions = {}
): string {
  const { basePath = '/', locale } = options;
  const { tags, categories } = filters;

  const hasTags = tags.length > 0;
  const hasCategories = categories.length > 0;
  const localePrefix = locale ? `/${locale}` : '';

  // No filters: return base path
  if (!hasTags && !hasCategories) {
    return `${localePrefix}${basePath}`;
  }

  // Single tag, no categories: clean URL
  if (tags.length === 1 && !hasCategories) {
    const encodedTag = encodeFilterValue(tags[0]);
    return `${localePrefix}/tags/${encodedTag}`;
  }

  // Single category, no tags: clean URL
  if (categories.length === 1 && !hasTags) {
    const encodedCategory = encodeFilterValue(categories[0]);
    return `${localePrefix}/categories/${encodedCategory}`;
  }

  // Multiple filters: use query parameters
  const params = new URLSearchParams();

  if (hasTags) {
    const encodedTags = tags.map(encodeFilterValue).join(',');
    params.set('tags', encodedTags);
  }

  if (hasCategories) {
    const encodedCategories = categories.map(encodeFilterValue).join(',');
    params.set('categories', encodedCategories);
  }

  return `${localePrefix}${basePath}?${params.toString()}`;
}

/**
 * Parse filter state from URL search params
 */
export function parseFilterFromSearchParams(searchParams: URLSearchParams): FilterState {
  const tagsParam = searchParams.get('tags');
  const categoriesParam = searchParams.get('categories');

  return {
    tags: tagsParam
      ? tagsParam.split(',').map(decodeFilterValue).filter(Boolean)
      : [],
    categories: categoriesParam
      ? categoriesParam.split(',').map(decodeFilterValue).filter(Boolean)
      : [],
  };
}

/**
 * Parse filter state from a tag page route (e.g., /tags/project-management)
 */
export function parseFilterFromTagRoute(tagSlug: string): FilterState {
  return {
    tags: [decodeFilterValue(tagSlug)],
    categories: [],
  };
}

/**
 * Parse filter state from a category page route (e.g., /categories/team-tools)
 */
export function parseFilterFromCategoryRoute(categorySlug: string): FilterState {
  return {
    tags: [],
    categories: [decodeFilterValue(categorySlug)],
  };
}

/**
 * Check if a filter state is empty (no filters selected)
 */
export function isFilterEmpty(filters: FilterState): boolean {
  return filters.tags.length === 0 && filters.categories.length === 0;
}

/**
 * Compare two filter states for equality
 */
export function areFiltersEqual(a: FilterState, b: FilterState): boolean {
  const tagsEqual =
    a.tags.length === b.tags.length &&
    a.tags.every((tag, index) => tag === b.tags[index]);

  const categoriesEqual =
    a.categories.length === b.categories.length &&
    a.categories.every((cat, index) => cat === b.categories[index]);

  return tagsEqual && categoriesEqual;
}

/**
 * Create a filter state with a single tag added
 */
export function addTagToFilters(filters: FilterState, tag: string): FilterState {
  if (filters.tags.includes(tag)) {
    return filters;
  }

  return {
    ...filters,
    tags: [...filters.tags, tag],
  };
}

/**
 * Create a filter state with a single tag removed
 */
export function removeTagFromFilters(filters: FilterState, tag: string): FilterState {
  return {
    ...filters,
    tags: filters.tags.filter(t => t !== tag),
  };
}

/**
 * Create a filter state with a single category added
 */
export function addCategoryToFilters(filters: FilterState, category: string): FilterState {
  if (filters.categories.includes(category)) {
    return filters;
  }

  return {
    ...filters,
    categories: [...filters.categories, category],
  };
}

/**
 * Create a filter state with a single category removed
 */
export function removeCategoryFromFilters(filters: FilterState, category: string): FilterState {
  return {
    ...filters,
    categories: filters.categories.filter(c => c !== category),
  };
}

/**
 * Toggle a tag in the filter state
 */
export function toggleTagInFilters(filters: FilterState, tag: string): FilterState {
  if (filters.tags.includes(tag)) {
    return removeTagFromFilters(filters, tag);
  }
  return addTagToFilters(filters, tag);
}

/**
 * Toggle a category in the filter state
 */
export function toggleCategoryInFilters(filters: FilterState, category: string): FilterState {
  if (filters.categories.includes(category)) {
    return removeCategoryFromFilters(filters, category);
  }
  return addCategoryToFilters(filters, category);
}

/**
 * Clear all filters
 */
export function clearAllFilters(): FilterState {
  return {
    tags: [],
    categories: [],
  };
}
