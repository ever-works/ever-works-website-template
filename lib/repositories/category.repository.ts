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

    // Filter inactive categories if requested
    if (!options.includeInactive) {
      filteredCategories = categories.filter(cat => cat.isActive !== false);
    }

    // Sort categories
    filteredCategories = this.sortCategories(filteredCategories, options);

    return filteredCategories;
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
      id: this.generateId(data.name),
      name: data.name.trim(),
      description: data.description?.trim(),
      color: data.color || CATEGORY_VALIDATION.DEFAULT_COLOR,
      icon: data.icon?.trim(),
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? await this.getNextSortOrder(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      ...Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      ),
      updatedAt: new Date().toISOString(),
    };

    // Clean up undefined values
    if (data.name) updatedCategory.name = data.name.trim();
    if (data.description !== undefined) updatedCategory.description = data.description?.trim();
    if (data.icon !== undefined) updatedCategory.icon = data.icon?.trim();

    // Replace in array
    categories[categoryIndex] = updatedCategory;

    // Create backup before writing
    await categoryFileService.createBackup();

    // Write updated categories
    await categoryFileService.writeCategories(categories);

    return updatedCategory;
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<void> {
    const categories = await categoryFileService.readCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${id} not found`);
    }

    // Soft delete
    categories[categoryIndex].isActive = false;
    categories[categoryIndex].updatedAt = new Date().toISOString();

    // Create backup before writing
    await categoryFileService.createBackup();

    // Write updated categories
    await categoryFileService.writeCategories(categories);
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
   * Reorder categories
   */
  async reorder(categoryIds: string[]): Promise<void> {
    const categories = await categoryFileService.readCategories();
    
    // Update sort orders
    const updatedCategories = categories.map(category => {
      const newIndex = categoryIds.indexOf(category.id);
      if (newIndex !== -1) {
        return {
          ...category,
          sortOrder: newIndex,
          updatedAt: new Date().toISOString(),
        };
      }
      return category;
    });

    // Create backup before writing
    await categoryFileService.createBackup();

    // Write updated categories
    await categoryFileService.writeCategories(updatedCategories);
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

    if (data.description && data.description.length > CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      throw new Error(`Category description must be no more than ${CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH} characters long`);
    }

    if (data.color && !CATEGORY_VALIDATION.ALLOWED_COLORS.includes(data.color as any)) {
      throw new Error(`Invalid color. Allowed colors: ${CATEGORY_VALIDATION.ALLOWED_COLORS.join(', ')}`);
    }
  }

  private validateUpdateData(data: UpdateCategoryRequest): void {
    if (!data.id) {
      throw new Error('Category ID is required for updates');
    }

    // Validate other fields if provided
    if (data.name !== undefined) {
      this.validateCategoryData({ name: data.name } as CreateCategoryRequest);
    }
    if (data.description !== undefined && data.description.length > CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      throw new Error(`Category description must be no more than ${CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH} characters long`);
    }
    if (data.color && !CATEGORY_VALIDATION.ALLOWED_COLORS.includes(data.color as any)) {
      throw new Error(`Invalid color. Allowed colors: ${CATEGORY_VALIDATION.ALLOWED_COLORS.join(', ')}`);
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

  private async getNextSortOrder(): Promise<number> {
    const categories = await categoryFileService.readCategories();
    const maxSortOrder = Math.max(...categories.map(cat => cat.sortOrder || 0), -1);
    return maxSortOrder + 1;
  }

  private sortCategories(categories: CategoryData[], options: CategoryListOptions): CategoryData[] {
    const { sortBy = 'sortOrder', sortOrder = 'asc' } = options;

    return categories.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'sortOrder':
        default:
          comparison = (a.sortOrder || 0) - (b.sortOrder || 0);
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