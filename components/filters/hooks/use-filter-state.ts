import { useState, useCallback } from 'react';
import { SORT_OPTIONS } from '../constants';
import { SortOption, TagId } from '../types';

/**
 * Custom hook for managing filter state
 * Handles search term, selected tags, and sorting
 */
export function useFilterState() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagId[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.POPULARITY);
  const [selectedTag, setSelectedTag] = useState<TagId | null>(null);

  /**
   * Clear all active filters
   */
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedTags([]);
    setSortBy(SORT_OPTIONS.POPULARITY);
    setSelectedTag(null);
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
    
    // Setters
    setSearchTerm,
    setSelectedTags,
    setSortBy,
    setSelectedTag,
    
    // Actions
    clearAllFilters,
    removeSelectedTag,
    addSelectedTag,
    toggleSelectedTag,
  };
} 