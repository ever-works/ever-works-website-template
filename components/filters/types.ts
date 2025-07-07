import { Category, Tag } from "@/lib/content";
import { ReactNode, Dispatch, SetStateAction } from "react";

/**
 * Filter context types
 */
export interface FilterContextType {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedTags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  clearAllFilters: () => void;
  removeSelectedTag: (tagId: string) => void;
  addSelectedTag: (tagId: string) => void;
  toggleSelectedTag: (tagId: string) => void;
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
  paginationType?: "standard" | "infinite";
  onLoadMore?: (page: number) => Promise<void>;
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
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

/**
 * Active filters component props
 */
export interface ActiveFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  availableTags: Tag[];
  clearAllFilters: () => void;
} 