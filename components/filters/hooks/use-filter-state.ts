import { useState, useCallback } from 'react';
import { SORT_OPTIONS } from '../constants';
import { SortOption, TagId, CategoryId } from '../types';

/**
 * Custom hook for managing filter state
 * Handles search term, selected tags, and sorting
 */
export function useFilterState() {
  const [searchTerm, setSearchTerm] = useState("");
  
  /** Multiple tag selection for advanced filtering - allows selecting multiple tags simultaneously */
  const [selectedTags, setSelectedTags] = useState<TagId[]>([]);
  
  /** Multiple category selection for advanced filtering */
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.POPULARITY);
  
  /** Single tag selection for navigation - used when navigating to a specific tag page */
  const [selectedTag, setSelectedTag] = useState<TagId | null>(null);
  
  /** Currently selected category for navigation and filtering */
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  /**
   * Clear all active filters
   */
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedCategories([]);
    setSortBy(SORT_OPTIONS.POPULARITY);
    setSelectedTag(null);
    setSelectedCategory(null);
  }, []);

  /**
   * Remove a specific tag from selected tags
   */
  const removeSelectedTag = useCallback((tagId: TagId) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  }, []);

  /**
   * Add a tag to selected tags
   */
  const addSelectedTag = useCallback((tagId: TagId) => {
    setSelectedTags(prev => [...prev, tagId]);
  }, []);

  /**
   * Toggle a tag selection
   */
  const toggleSelectedTag = useCallback((tagId: TagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  /**
   * Remove a specific category from selected categories
   */
  const removeSelectedCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
  }, []);

  /**
   * Add a category to selected categories
   */
  const addSelectedCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => [...prev, categoryId]);
  }, []);

  /**
   * Toggle a category selection
   */
  const toggleSelectedCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  /**
   * Clear all selected categories
   */
  const clearSelectedCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

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