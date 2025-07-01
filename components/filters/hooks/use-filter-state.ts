import { useState, useCallback } from 'react';
import { SORT_OPTIONS } from '../constants';

/**
 * Custom hook for managing filter state
 * Handles search term, selected tags, and sorting
 */
export function useFilterState() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS.POPULARITY);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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