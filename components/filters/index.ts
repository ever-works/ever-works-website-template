/**
 * Filters module exports
 * Centralized exports for all filter-related components and utilities
 */

// Types and constants
export * from './types';
export * from './constants';

// Context and providers
export { FilterProvider, FilterContext, useFilters } from './context/filter-context';

// Hooks
export { useFilterState } from './hooks/use-filter-state';
export { useStickyHeader } from './hooks/use-sticky-header';
export { useTagVisibility } from './hooks/use-tag-visibility';

// TODO: Add exports as we create the files in subsequent phases
// Components
// export { Categories } from './components/categories/categories-section';
// export { Tags } from './components/tags/tags-section';
// export { Paginate } from './components/pagination/paginate';
// export { FilterControls } from './components/controls/filter-controls';
// export { ActiveFilters } from './components/active-filters/active-filters';

// Utilities
// export * from './utils/filter-utils';
// export * from './utils/text-utils';
// export * from './utils/style-utils'; 