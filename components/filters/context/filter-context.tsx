"use client";
import { createContext, useContext } from 'react';
import { FilterContextType } from '../types';
import { useFilterState } from '../hooks/use-filter-state';

/**
 * Filter context for sharing filter state across components
 */
export const FilterContext = createContext<FilterContextType | null>(null);

/**
 * Hook to use filter context
 */
export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

/**
 * Filter provider component
 * Provides filter state to child components
 */
export function FilterProvider({ children }: { children: React.ReactNode }) {
  const filterState = useFilterState();

  return (
    <FilterContext.Provider value={filterState}>
      {children}
    </FilterContext.Provider>
  );
} 