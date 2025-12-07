import { ItemData, ItemListResponse } from './item';

/**
 * Client submission data with engagement metrics
 */
export interface ClientSubmissionData extends ItemData {
  views?: number;
  likes?: number;
}

/**
 * Response from GET /api/client/items/:id endpoint
 */
export interface ClientItemResponse {
  success: boolean;
  item: ClientSubmissionData;
  engagement: {
    views: number;
    likes: number;
  };
}

/**
 * Response for client items list
 */
export interface ClientItemListResponse extends ItemListResponse {
  items: ClientSubmissionData[];
  stats: ClientItemStats;
}

/**
 * Client item statistics
 */
export interface ClientItemStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  deleted: number;
}

/**
 * Request to update a client item
 * Limited fields that clients can modify (excludes admin-only fields)
 */
export interface ClientUpdateItemRequest {
  name?: string;
  description?: string;
  source_url?: string;
  category?: string | string[];
  tags?: string[];
  icon_url?: string;
}

/**
 * Response after updating a client item
 */
export interface ClientUpdateItemResponse {
  success: boolean;
  item?: ClientSubmissionData;
  statusChanged?: boolean; // True if status changed from approved to pending
  previousStatus?: string;
  error?: string;
  message?: string;
}

/**
 * Response after deleting (soft delete) a client item
 */
export interface ClientDeleteItemResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Parameters for listing client items (used by hooks)
 */
export interface ClientItemsListParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'all';
  search?: string;
  sortBy?: 'name' | 'updated_at' | 'status' | 'submitted_at';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Status filter values for UI
 * Labels should be derived via useTranslations in the UI component
 * using the 'admin.items.STATUS_OPTIONS' namespace
 */
export const CLIENT_STATUS_FILTERS = [
  { value: 'all', labelKey: 'ALL' },
  { value: 'approved', labelKey: 'APPROVED' },
  { value: 'pending', labelKey: 'PENDING' },
  { value: 'rejected', labelKey: 'REJECTED' },
  { value: 'draft', labelKey: 'DRAFT' },
] as const;

export type ClientStatusFilter = typeof CLIENT_STATUS_FILTERS[number]['value'];
