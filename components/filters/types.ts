import { Category, Tag } from "@/lib/content";
import { ReactNode, Dispatch, SetStateAction } from "react";

/**
 * Filter context types
 */
// Define possible sort options as a union type
export type SortOption = 'popularity' | 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc';

// Define possible category/tag selection states
export type CategoryId = string;
export type TagId = string;

export interface FilterContextType {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedTags: TagId[];
  setSelectedTags: Dispatch<SetStateAction<TagId[]>>;
  sortBy: SortOption;
  setSortBy: Dispatch<SetStateAction<SortOption>>;
  clearAllFilters: () => void;
  removeSelectedTag: (tagId: TagId) => void;
  addSelectedTag: (tagId: TagId) => void;
  toggleSelectedTag: (tagId: TagId) => void;
  selectedCategory: CategoryId | null;
  setSelectedCategory: Dispatch<SetStateAction<CategoryId | null>>;
  selectedTag: TagId | null;
  setSelectedTag: Dispatch<SetStateAction<TagId | null>>;
}

/**
 * Block link component props
 */
export interface BlockLinkProps {
  href: string;
  isActive: boolean;
  isAllCategories?: boolean;
  children: ReactNode;
}

/**
 * Categories list component props
 */
export interface CategoriesListProps {
  categories: Category[];
}

/**
 * Categories component props
 */
export interface CategoriesProps {
  total: number;
  categories: Category[];
}

/**
 * Pagination component props
 */
export interface PaginateProps {
  basePath: string;
  initialPage: number;
  total: number;
}

/**
 * Tags component props
 */
export interface TagsProps {
  tags: Tag[];
  basePath?: string;
  resetPath?: string;
  enableSticky?: boolean;
  maxVisibleTags?: number;
  total?: number;
  mode?: 'navigation' | 'filter';
}

/**
 * Tag item component props
 */
export interface TagItemProps {
  tag: Tag;
  isActive: boolean;
  href: string;
  showCount?: boolean;
}

/**
 * Category item component props
 */
export interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  href: string;
  isAllCategories?: boolean;
  totalItems?: number;
}

/**
 * Filter controls component props
 */
export interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  selectedTags: TagId[];
  setSelectedTags: (tags: TagId[]) => void;
}

/**
 * Active filters component props
 */
export interface ActiveFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: TagId[];
  setSelectedTags: (tags: TagId[]) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  availableTags: Tag[];
  clearAllFilters: () => void;
} 