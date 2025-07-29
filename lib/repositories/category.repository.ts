import "server-only";
import { 
  CategoryData, 
  CategoryWithCount, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  CategoryListOptions,
  CATEGORY_VALIDATION 
} from "@/lib/types/category";
import { categoryFileService } from "@/lib/services/category-file.service";

/**
 * Repository for category business logic operations
 * Follows Repository Pattern and Single Responsibility Principle
 */
export class CategoryRepository {
  
  /**
   * Get all categories with optional filtering and sorting
   */
  async findAll(options: CategoryListOptions = {}): Promise<CategoryWithCount[]> {
    const categories = await categoryFileService.readCategories();
    
    let filteredCategories = categories;

    // All categories are considered active since we removed isActive field
    // This filter is kept for backward compatibility but always returns all categories
    if (!options.includeInactive) {
      filteredCategories = categories; // All categories are active
    }

    // Sort categories
    filteredCategories = this.sortCategories(filteredCategories, options);

    return filteredCategories;
  }

  /**
   * Find all categories with pagination
   */
  async findAllPaginated(options: CategoryListOptions = {}): Promise<{
    categories: CategoryWithCount[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filterOptions } = options;
    
    // Get all filtered and sorted categories
    const allCategories = await this.findAll(filterOptions);
    const total = allCategories.length;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const paginatedCategories = allCategories.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);
    
    return {
      categories: paginatedCategories,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<CategoryData | null> {
    const categories = await categoryFileService.readCategories();
    return categories.find(cat => cat.id === id) || null;
  }

  /**
   * Find category by slug (using ID as slug for now)
   */
  async findBySlug(slug: string): Promise<CategoryData | null> {
    return this.findById(slug);
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryRequest): Promise<CategoryData> {
    // Validate input
    this.validateCategoryData(data);

    // Check for duplicate names
    await this.checkDuplicateName(data.name);

    // Create new category with defaults
    const newCategory: CategoryData = {
      id: data.id,
      name: data.name.trim(),
    };

    // Read existing categories
    const categories = await categoryFileService.readCategories();
    
    // Add new category
    categories.push(newCategory);
    
    // Create backup before writing
    await categoryFileService.createBackup();
    
    // Write updated categories
    await categoryFileService.writeCategories(categories);

    return newCategory;
  }

  /**
   * Update an existing category
   */
  async update(data: UpdateCategoryRequest): Promise<CategoryData> {
    // Validate input
    this.validateUpdateData(data);

    // Find existing category
    const categories = await categoryFileService.readCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === data.id);
    
    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${data.id} not found`);
    }

    // Check for duplicate name if name is being changed
    if (data.name && data.name !== categories[categoryIndex].name) {
      await this.checkDuplicateName(data.name, data.id);
    }

    // Update category
    const updatedCategory: CategoryData = {
      ...categories[categoryIndex],
      name: data.name?.trim() || categories[categoryIndex].name,
    };

    // Replace in array
    categories[categoryIndex] = updatedCategory;

    // Create backup before writing
    await categoryFileService.createBackup();

    // Write updated categories
    await categoryFileService.writeCategories(categories);

    return updatedCategory;
  }

  /**
   * Delete a category (hard delete since we removed isActive)
   */
  async delete(id: string): Promise<void> {
    // Since we removed isActive, we'll do a hard delete
    await this.hardDelete(id);
  }

  /**
   * Hard delete a category (remove from file)
   */
  async hardDelete(id: string): Promise<void> {
    const categories = await categoryFileService.readCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    
    if (filteredCategories.length === categories.length) {
      throw new Error(`Category with ID ${id} not found`);
    }

    // Create backup before writing
    await categoryFileService.createBackup();

    // Write updated categories
    await categoryFileService.writeCategories(filteredCategories);
  }

  /**
   * Reorder categories (simplified - just reorder by name for now)
   */
  async reorder(categoryIds: string[]): Promise<void> {
    const categories = await categoryFileService.readCategories();
    
    // Reorder categories based on the provided IDs
    const reorderedCategories = categoryIds
      .map(id => categories.find(cat => cat.id === id))
      .filter(Boolean) as CategoryData[];

    // Add any remaining categories that weren't in the reorder list
    const remainingCategories = categories.filter(cat => !categoryIds.includes(cat.id));
    reorderedCategories.push(...remainingCategories);

    // Create backup before writing
    await categoryFileService.createBackup();

    // Write updated categories
    await categoryFileService.writeCategories(reorderedCategories);
  }

  /**
   * Private helper methods
   */
  private validateCategoryData(data: CreateCategoryRequest): void {
    if (!data.name || data.name.trim().length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
      throw new Error(`Category name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters long`);
    }

    if (data.name.trim().length > CATEGORY_VALIDATION.NAME_MAX_LENGTH) {
      throw new Error(`Category name must be no more than ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters long`);
    }

    if (!data.id || data.id.trim().length < 3) {
      throw new Error('Category ID must be at least 3 characters long');
    }

    if (data.id.trim().length > 50) {
      throw new Error('Category ID must be no more than 50 characters long');
    }

    if (!/^[a-z0-9-]+$/.test(data.id.trim())) {
      throw new Error('Category ID must contain only lowercase letters, numbers, and hyphens');
    }
  }

  private validateUpdateData(data: UpdateCategoryRequest): void {
    if (!data.id) {
      throw new Error('Category ID is required for updates');
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
        throw new Error(`Category name must be at least ${CATEGORY_VALIDATION.NAME_MIN_LENGTH} characters long`);
      }

      if (data.name.trim().length > CATEGORY_VALIDATION.NAME_MAX_LENGTH) {
        throw new Error(`Category name must be no more than ${CATEGORY_VALIDATION.NAME_MAX_LENGTH} characters long`);
      }
    }
  }

  private async checkDuplicateName(name: string, excludeId?: string): Promise<void> {
    const categories = await categoryFileService.readCategories();
    const duplicate = categories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && 
      cat.id !== excludeId
    );
    
    if (duplicate) {
      throw new Error(`Category with name "${name}" already exists`);
    }
  }

  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  private sortCategories(categories: CategoryData[], options: CategoryListOptions): CategoryData[] {
    const { sortBy = 'name', sortOrder = 'asc' } = options;

    return categories.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}

/**
 * Singleton instance
 */
export const categoryRepository = new CategoryRepository(); 