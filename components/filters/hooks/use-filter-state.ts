import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { SORT_OPTIONS } from '../constants';
import { SortOption, TagId, CategoryId } from '../types';
import { useFilterURLSync } from './use-filter-url-sync';
import type { FilterState } from '@/lib/utils/url-filter-sync';

/**
 * Type guard to check if a string is a valid SortOption
 */
function isValidSortOption(value: string): value is SortOption {
  return ['popularity', 'name-asc', 'name-desc', 'date-desc', 'date-asc'].includes(value);
}

/**
 * Custom hook for managing filter state
 * Handles search term, selected tags, and sorting
 * Automatically syncs with URL for bookmarkable/shareable filter states
 */
export function useFilterState(initialTag?: string | null, initialCategory?: string | null, initialSortBy?: string) {
  const params = useParams();
  const locale = params?.locale as string | undefined;

  const [searchTerm, setSearchTerm] = useState("");

  /** Multiple tag selection for advanced filtering - allows selecting multiple tags simultaneously */
  const [selectedTags, setSelectedTagsInternal] = useState<TagId[]>(
    initialTag ? [initialTag] : []
  );

  /** Multiple category selection for advanced filtering */
  const [selectedCategories, setSelectedCategoriesInternal] = useState<CategoryId[]>(
    initialCategory ? [initialCategory] : []
  );

  const [sortBy, setSortBy] = useState<SortOption>(
    initialSortBy && isValidSortOption(initialSortBy) ? initialSortBy : SORT_OPTIONS.POPULARITY
  );

  /** Single tag selection for navigation - used when navigating to a specific tag page */
  const [selectedTag, setSelectedTag] = useState<TagId | null>(initialTag || null);

  /** Currently selected category for navigation and filtering */
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(initialCategory || null);

  /** Loading state for filter updates */
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL synchronization (only for updates, not parsing)
  const { updateURL } = useFilterURLSync({ basePath: '/', locale });

  /**
   * Cleanup: Clear loading timeout on unmount to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Wrapped setter that updates both state and URL
   */
  const setSelectedTags = useCallback((tags: TagId[] | ((prev: TagId[]) => TagId[])) => {
    // Store the computed new tags to use in both setters
    let computedTags: TagId[] = [];

    setSelectedTagsInternal(prev => {
      computedTags = typeof tags === 'function' ? tags(prev) : tags;
      return computedTags;
    });

    // Show loading indicator AFTER state is set (non-blocking)
    setSelectedCategoriesInternal(currentCategories => {
      const filterState: FilterState = {
        tags: computedTags,
        categories: currentCategories,
      };

      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Show loading indicator
      setIsFiltersLoading(true);

      // Update URL
      updateURL(filterState);

      // Hide loading after delay
      loadingTimeoutRef.current = setTimeout(() => {
        setIsFiltersLoading(false);
      }, 400);

      return currentCategories;
    });
  }, [updateURL]);

  /**
   * Wrapped setter that updates both state and URL
   */
  const setSelectedCategories = useCallback((categories: CategoryId[] | ((prev: CategoryId[]) => CategoryId[])) => {
    // Store the computed new categories to use in both setters
    let computedCategories: CategoryId[] = [];

    setSelectedCategoriesInternal(prev => {
      computedCategories = typeof categories === 'function' ? categories(prev) : categories;
      return computedCategories;
    });

    // Show loading indicator AFTER state is set (non-blocking)
    setSelectedTagsInternal(currentTags => {
      const filterState: FilterState = {
        tags: currentTags,
        categories: computedCategories,
      };

      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Show loading indicator
      setIsFiltersLoading(true);

      // Update URL
      updateURL(filterState);

      // Hide loading after delay
      loadingTimeoutRef.current = setTimeout(() => {
        setIsFiltersLoading(false);
      }, 400);

      return currentTags;
    });
  }, [updateURL]);

  /**
   * Clear all active filters
   */
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedTagsInternal([]);
    setSelectedCategoriesInternal([]);
    setSortBy(SORT_OPTIONS.POPULARITY);
    setSelectedTag(null);
    setSelectedCategory(null);

    // Update URL to clear filters
    updateURL({ tags: [], categories: [] }, true);
  }, [updateURL]);

  /**
   * Remove a specific tag from selected tags
   */
  const removeSelectedTag = useCallback((tagId: TagId) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  }, [setSelectedTags]);

  /**
   * Add a tag to selected tags
   */
  const addSelectedTag = useCallback((tagId: TagId) => {
    setSelectedTags(prev => [...prev, tagId]);
  }, [setSelectedTags]);

  /**
   * Toggle a tag selection
   */
  const toggleSelectedTag = useCallback((tagId: TagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, [setSelectedTags]);

  /**
   * Remove a specific category from selected categories
   */
  const removeSelectedCategory = useCallback((categoryId: CategoryId) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
  }, [setSelectedCategories]);

  /**
   * Add a category to selected categories
   */
  const addSelectedCategory = useCallback((categoryId: CategoryId) => {
    setSelectedCategories(prev => [...prev, categoryId]);
  }, [setSelectedCategories]);

  /**
   * Toggle a category selection
   */
  const toggleSelectedCategory = useCallback((categoryId: CategoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, [setSelectedCategories]);

  /**
   * Clear all selected categories
   */
  const clearSelectedCategories = useCallback(() => {
    setSelectedCategories([]);
  }, [setSelectedCategories]);

  return {
    // State
    searchTerm,
    selectedTags,
    selectedCategories,
    sortBy,
    selectedTag,
    selectedCategory,
    isFiltersLoading,

    // Setters
    setSearchTerm,
    setSelectedTags,
    setSelectedCategories,
    setSortBy,
    setSelectedTag,
    setSelectedCategory,

    // Actions
    clearAllFilters,
    removeSelectedTag,
    addSelectedTag,
    toggleSelectedTag,
    removeSelectedCategory,
    addSelectedCategory,
    toggleSelectedCategory,
    clearSelectedCategories,
  };
} 