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

  return {
    // State
    searchTerm,
    selectedTags,
    sortBy,
    selectedTag,
    selectedCategory,
    
    // Setters
    setSearchTerm,
    setSelectedTags,
    setSortBy,
    setSelectedTag,
    setSelectedCategory,
    
    // Actions
    clearAllFilters,
    removeSelectedTag,
    addSelectedTag,
    toggleSelectedTag,
  };
} 