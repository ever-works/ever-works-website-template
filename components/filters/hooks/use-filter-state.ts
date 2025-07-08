import { useState, useCallback } from 'react';
import { SORT_OPTIONS } from '../constants';

/**
 * Custom hook for managing filter state
 * Handles search term, selected tags, and sorting
 */
export function useFilterState() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS.POPULARITY);

  /**
   * Clear all active filters
   */
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedCategories([]);
    setSortBy(SORT_OPTIONS.POPULARITY);
  }, []);

  /**
   * Remove a specific tag from selected tags
   */
  const removeSelectedTag = useCallback((tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  }, []);

  /**
   * Add a tag to selected tags
   */
  const addSelectedTag = useCallback((tagId: string) => {
    setSelectedTags(prev => [...prev, tagId]);
  }, []);

  /**
   * Toggle a tag selection
   */
  const toggleSelectedTag = useCallback((tagId: string) => {
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
    
    // Setters
    setSearchTerm,
    setSelectedTags,
    setSelectedCategories,
    setSortBy,
    
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