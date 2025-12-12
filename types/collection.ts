/**
 * Collection type representing a curated group of items organized by theme
 */
export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url?: string;
  item_count: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * API response type for collections list
 */
export interface CollectionsResponse {
  collections: Collection[];
  total: number;
}

/**
 * API response type for single collection with items
 */
export interface CollectionDetailResponse {
  collection: Collection;
  items: any[]; // Using any[] for now, should match your Item type
  total: number;
}
