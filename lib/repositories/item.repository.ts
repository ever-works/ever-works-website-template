import { ItemData, CreateItemRequest, UpdateItemRequest, ReviewRequest, ItemListOptions } from '@/lib/types/item';
import { createItemGitService, ItemGitServiceConfig, ItemGitService } from '@/lib/services/item-git.service';

export class ItemRepository {
  private gitService: ItemGitService | null = null;

  constructor() {}

  private async getGitService(): Promise<ItemGitService> {
    if (!this.gitService) {
      const dataRepo = process.env.DATA_REPOSITORY;
      const token = process.env.GH_TOKEN;
      
      if (!dataRepo || !token) {
        throw new Error('DATA_REPOSITORY and GH_TOKEN environment variables are required');
      }

      // Parse DATA_REPOSITORY URL to extract owner and repo
      const match = dataRepo.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid DATA_REPOSITORY format. Expected: https://github.com/owner/repo');
      }

      const [, owner, repo] = match;
      const config: ItemGitServiceConfig = {
        owner,
        repo,
        token,
        branch: process.env.GITHUB_BRANCH || 'main',
        dataDir: './.content',
        itemsDir: 'data',
      };

      this.gitService = await createItemGitService(config);
    }
    return this.gitService;
  }

  async findAll(options: ItemListOptions = {}): Promise<ItemData[]> {
    const gitService = await this.getGitService();
    const result = await gitService.getItemsPaginated(
      options.page || 1,
      options.limit || 10,
      {
        status: options.status,
        category: options.category,
        tag: options.tag,
      }
    );
    return result.items;
  }

  async findAllPaginated(page: number = 1, limit: number = 10, options: ItemListOptions = {}): Promise<{
    items: ItemData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const gitService = await this.getGitService();
    return await gitService.getItemsPaginated(page, limit, {
      status: options.status,
      category: options.category,
      tag: options.tag,
    });
  }

  async findById(id: string): Promise<ItemData | null> {
    const gitService = await this.getGitService();
    return await gitService.findItemById(id);
  }

  async findBySlug(slug: string): Promise<ItemData | null> {
    const gitService = await this.getGitService();
    return await gitService.findItemBySlug(slug);
  }

  async create(data: CreateItemRequest): Promise<ItemData> {
    this.validateCreateData(data);
    
    const gitService = await this.getGitService();
    return await gitService.createItem(data);
  }

  async update(id: string, data: UpdateItemRequest): Promise<ItemData> {
    this.validateUpdateData(id, data);
    
    const gitService = await this.getGitService();
    return await gitService.updateItem(id, data);
  }

  async review(id: string, reviewData: ReviewRequest): Promise<ItemData> {
    this.validateReviewData(reviewData);
    
    const gitService = await this.getGitService();
    return await gitService.reviewItem(id, reviewData);
  }

  async delete(id: string): Promise<void> {
    const gitService = await this.getGitService();
    await gitService.deleteItem(id);
  }

  async checkDuplicateId(id: string): Promise<boolean> {
    const gitService = await this.getGitService();
    const items = await gitService.readItems();
    return items.some((item: ItemData) => item.id === id);
  }

  async checkDuplicateSlug(slug: string): Promise<boolean> {
    const gitService = await this.getGitService();
    const items = await gitService.readItems();
    return items.some((item: ItemData) => item.slug === slug);
  }

  async getStats(): Promise<{
    total: number;
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const gitService = await this.getGitService();
    const items = await gitService.readItems();
    
    return {
      total: items.length,
      draft: items.filter((item: ItemData) => item.status === 'draft').length,
      pending: items.filter((item: ItemData) => item.status === 'pending').length,
      approved: items.filter((item: ItemData) => item.status === 'approved').length,
      rejected: items.filter((item: ItemData) => item.status === 'rejected').length,
    };
  }

  private validateCreateData(data: CreateItemRequest): void {
    if (!data.id || data.id.trim().length === 0) {
      throw new Error('Item ID is required');
    }
    
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Item name is required');
    }
    
    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error('Item slug is required');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Item description is required');
    }
    
    if (!data.source_url || data.source_url.trim().length === 0) {
      throw new Error('Item source URL is required');
    }
    
    // Validate slug format (lowercase, hyphens, no spaces)
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    
    // Validate URL format
    try {
      new URL(data.source_url);
    } catch {
      throw new Error('Invalid source URL format');
    }
  }

  private validateUpdateData(id: string, data: UpdateItemRequest): void {
    if (!id || id.trim().length === 0) {
      throw new Error('Item ID is required');
    }
    
    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      throw new Error('Item name cannot be empty');
    }
    
    if (data.slug !== undefined) {
      if (!data.slug || data.slug.trim().length === 0) {
        throw new Error('Item slug cannot be empty');
      }
      
      if (!/^[a-z0-9-]+$/.test(data.slug)) {
        throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
      }
    }
    
    if (data.source_url !== undefined) {
      try {
        new URL(data.source_url);
      } catch {
        throw new Error('Invalid source URL format');
      }
    }
  }

  private validateReviewData(data: ReviewRequest): void {
    if (!data.status || !['approved', 'rejected'].includes(data.status)) {
      throw new Error('Review status must be either "approved" or "rejected"');
    }
  }
} 