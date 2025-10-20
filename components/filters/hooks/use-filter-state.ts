import { useState, useCallback, useEffect } from 'react';
import { SORT_OPTIONS } from '../constants';
import { SortOption, TagId, CategoryId } from '../types';
import { useFilterURLSync } from './use-filter-url-sync';
import type { FilterState } from '@/lib/utils/url-filter-sync';

/**
 * Custom hook for managing filter state
 * Handles search term, selected tags, and sorting
 * Automatically syncs with URL for bookmarkable/shareable filter states
 */
export function useFilterState(initialTag?: string | null, initialCategory?: string | null) {
  const [searchTerm, setSearchTerm] = useState("");

  /** Multiple tag selection for advanced filtering - allows selecting multiple tags simultaneously */
  const [selectedTags, setSelectedTagsInternal] = useState<TagId[]>([]);

  /** Multiple category selection for advanced filtering */
  const [selectedCategories, setSelectedCategoriesInternal] = useState<CategoryId[]>([]);

  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.POPULARITY);

  /** Single tag selection for navigation - used when navigating to a specific tag page */
  const [selectedTag, setSelectedTag] = useState<TagId | null>(initialTag || null);

  /** Currently selected category for navigation and filtering */
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(initialCategory || null);

  // URL synchronization
  const { parseFiltersFromURL, updateURL } = useFilterURLSync({ basePath: '/' });

  /**
   * Initialize state from URL on mount
   */
  useEffect(() => {
    const urlFilters = parseFiltersFromURL();

    // Only set from URL if there are URL parameters and no initial tag/category
    if ((urlFilters.tags.length > 0 || urlFilters.categories.length > 0) && !initialTag && !initialCategory) {
      setSelectedTagsInternal(urlFilters.tags);
      setSelectedCategoriesInternal(urlFilters.categories);
    } else if (initialTag) {
      // If initial tag is provided (from tag page route), set it
      setSelectedTagsInternal([initialTag]);
    } else if (initialCategory) {
      // If initial category is provided (from category page route), set it
      setSelectedCategoriesInternal([initialCategory]);
    }
  }, [initialTag, initialCategory, parseFiltersFromURL]);

  /**
   * Wrapped setter that updates both state and URL
   */
  const setSelectedTags = useCallback((tags: TagId[] | ((prev: TagId[]) => TagId[])) => {
    setSelectedTagsInternal(prev => {
      const newTags = typeof tags === 'function' ? tags(prev) : tags;

      // Update URL with new filter state
      const filterState: FilterState = {
        tags: newTags,
        categories: selectedCategories,
      };
      updateURL(filterState);

      return newTags;
    });
  }, [selectedCategories, updateURL]);

  /**
   * Wrapped setter that updates both state and URL
   */
  const setSelectedCategories = useCallback((categories: CategoryId[] | ((prev: CategoryId[]) => CategoryId[])) => {
    setSelectedCategoriesInternal(prev => {
      const newCategories = typeof categories === 'function' ? categories(prev) : categories;

      // Update URL with new filter state
      const filterState: FilterState = {
        tags: selectedTags,
        categories: newCategories,
      };
      updateURL(filterState);

      return newCategories;
    });
  }, [selectedTags, updateURL]);

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