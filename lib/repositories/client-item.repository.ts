import { ItemData, UpdateItemRequest } from '@/lib/types/item';
import {
  ClientSubmissionData,
  ClientItemListResponse,
  ClientItemStats,
  ClientUpdateItemRequest,
  ClientItemsListParams,
} from '@/lib/types/client-item';
import { ItemRepository } from './item.repository';

/**
 * Repository for client-side item management operations.
 * Wraps ItemRepository with ownership validation and client-specific logic.
 */
export class ClientItemRepository {
  private itemRepository: ItemRepository;

  constructor() {
    this.itemRepository = new ItemRepository();
  }

  /**
   * Find all items for a specific user with pagination
   */
  async findByUserPaginated(
    userId: string,
    params: ClientItemsListParams = {}
  ): Promise<ClientItemListResponse> {
    const { page = 1, limit = 10, status, search, sortBy, sortOrder } = params;

    const result = await this.itemRepository.findAllPaginated(page, limit, {
      submittedBy: userId,
      status: status === 'all' ? undefined : status,
      search,
      sortBy,
      sortOrder,
      includeDeleted: false,
    });

    // Get stats for this user
    const stats = await this.getStatsByUser(userId);

    // Convert items to ClientSubmissionData (add engagement metrics)
    const items: ClientSubmissionData[] = result.items.map(item => ({
      ...item,
      views: 0, // TODO: Fetch from engagement tracking system
      likes: 0, // TODO: Fetch from engagement tracking system
    }));

    return {
      ...result,
      items,
      stats,
    };
  }

  /**
   * Find a single item by ID with ownership check
   */
  async findByIdForUser(
    id: string,
    userId: string,
    includeDeleted: boolean = false
  ): Promise<ClientSubmissionData | null> {
    const item = await this.itemRepository.findById(id, includeDeleted);

    if (!item) {
      return null;
    }

    // Ownership check
    if (item.submitted_by !== userId) {
      return null;
    }

    return {
      ...item,
      views: 0, // TODO: Fetch from engagement tracking system
      likes: 0, // TODO: Fetch from engagement tracking system
    };
  }

  /**
   * Update an item as a client (limited fields, ownership validation)
   * If item was approved, status changes to pending for re-review
   */
  async updateAsClient(
    id: string,
    userId: string,
    data: ClientUpdateItemRequest
  ): Promise<{ item: ItemData; statusChanged: boolean; previousStatus: string }> {
    // First, verify ownership
    const existingItem = await this.itemRepository.findById(id);

    if (!existingItem) {
      throw new Error('Item not found');
    }

    if (existingItem.submitted_by !== userId) {
      throw new Error('You do not have permission to edit this item');
    }

    if (existingItem.deleted_at) {
      throw new Error('Cannot edit a deleted item');
    }

    const previousStatus = existingItem.status;
    let statusChanged = false;

    // Build update request with only allowed fields
    const updateData: UpdateItemRequest = {
      id,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.source_url !== undefined && { source_url: data.source_url }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.icon_url !== undefined && { icon_url: data.icon_url }),
    };

    // If item was approved, change status to pending for re-review
    if (previousStatus === 'approved') {
      updateData.status = 'pending';
      statusChanged = true;
    }

    const updatedItem = await this.itemRepository.update(id, updateData);

    return {
      item: updatedItem,
      statusChanged,
      previousStatus,
    };
  }

  /**
   * Soft delete an item (ownership validation)
   */
  async softDeleteForUser(id: string, userId: string): Promise<ItemData> {
    // First, verify ownership (include deleted items to show proper error message)
    const existingItem = await this.itemRepository.findById(id, true);

    if (!existingItem) {
      throw new Error('Item not found');
    }

    if (existingItem.submitted_by !== userId) {
      throw new Error('You do not have permission to delete this item');
    }

    if (existingItem.deleted_at) {
      throw new Error('Item is already deleted');
    }

    return await this.itemRepository.softDelete(id);
  }

  /**
   * Restore a soft-deleted item (ownership validation)
   */
  async restoreForUser(id: string, userId: string): Promise<ItemData> {
    // First, verify ownership (include deleted items in search)
    const existingItem = await this.itemRepository.findById(id, true);

    if (!existingItem) {
      throw new Error('Item not found');
    }

    if (existingItem.submitted_by !== userId) {
      throw new Error('You do not have permission to restore this item');
    }

    if (!existingItem.deleted_at) {
      throw new Error('Item is not deleted');
    }

    return await this.itemRepository.restore(id);
  }

  /**
   * Find all deleted items for a specific user with pagination
   */
  async findDeletedByUser(
    userId: string,
    params: ClientItemsListParams = {}
  ): Promise<ClientItemListResponse> {
    const { page = 1, limit = 10, sortBy, sortOrder } = params;

    // Fetch all items for this user (including deleted) to filter properly
    // Note: We fetch all because filtering must happen before pagination
    const allResult = await this.itemRepository.findAllPaginated(1, Number.MAX_SAFE_INTEGER, {
      submittedBy: userId,
      includeDeleted: true,
      sortBy: sortBy || 'updated_at',
      sortOrder: sortOrder || 'desc',
    });

    // Filter to only deleted items
    const allDeletedItems = allResult.items.filter(item => item.deleted_at);

    // Apply pagination to filtered results
    const total = allDeletedItems.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = allDeletedItems.slice(startIndex, startIndex + limit);

    // Convert to ClientSubmissionData
    const items: ClientSubmissionData[] = paginatedItems.map(item => ({
      ...item,
      views: 0,
      likes: 0,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      stats: {
        total,
        pending: 0,
        approved: 0,
        rejected: 0,
        deleted: total,
      },
    };
  }

  /**
   * Get statistics for a specific user
   */
  async getStatsByUser(userId: string): Promise<ClientItemStats> {
    return await this.itemRepository.getStats({ submittedBy: userId });
  }

  /**
   * Check if user owns an item
   */
  async isOwner(id: string, userId: string): Promise<boolean> {
    const item = await this.itemRepository.findById(id, true);
    return item?.submitted_by === userId;
  }
}

// Singleton instance
let clientItemRepositoryInstance: ClientItemRepository | null = null;

export function getClientItemRepository(): ClientItemRepository {
  if (!clientItemRepositoryInstance) {
    clientItemRepositoryInstance = new ClientItemRepository();
  }
  return clientItemRepositoryInstance;
}
