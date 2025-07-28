// ######################### Category Types for File-Based System #########################

export interface CategoryData {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  icon_url?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryWithCount extends CategoryData {
  count?: number;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

export interface CategoryListResponse {
  categories: CategoryWithCount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryResponse {
  success: boolean;
  category?: CategoryData;
  error?: string;
}

export interface CategoryListOptions {
  includeInactive?: boolean;
  sortBy?: 'name' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Validation schemas
export const CATEGORY_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DEFAULT_COLOR: '#3B82F6',
  ALLOWED_COLORS: [
    '#3B82F6', // Blue
    '#10B981', // Green  
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ] as const,
} as const;

export type CategoryColor = typeof CATEGORY_VALIDATION.ALLOWED_COLORS[number]; 