import { ItemData, ItemListOptions, ItemListResponse } from './item';

/**
 * Client submission data with engagement metrics
 */
export interface ClientSubmissionData extends ItemData {
  views?: number;
  likes?: number;
}

/**
 * Options for listing client items
 */
export interface ClientItemListOptions extends Omit<ItemListOptions, 'submittedBy'> {
  // submittedBy is automatically set to the current user
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
 * Response for getting a single client item
 */
export interface ClientItemResponse {
  success: boolean;
  item?: ClientSubmissionData;
  engagement?: {
    views: number;
    likes: number;
  };
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
 * Status filter options for UI
 */
export const CLIENT_STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Draft' },
] as const;

export type ClientStatusFilter = typeof CLIENT_STATUS_FILTERS[number]['value'];
