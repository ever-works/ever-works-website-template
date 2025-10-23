/**
 * Twenty CRM Configuration Types
 * Types for Twenty CRM integration configuration
 */

/**
 * Sync mode options for Twenty CRM integration
 */
export type TwentyCrmSyncMode = 'disabled' | 'platform' | 'direct_crm';

/**
 * Twenty CRM configuration data structure
 */
export interface TwentyCrmConfig {
  id: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
  syncMode: TwentyCrmSyncMode;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Twenty CRM configuration with masked API key for responses
 */
export interface TwentyCrmConfigResponse {
  id: string;
  baseUrl: string;
  apiKey: string; // Masked value (e.g., "****key123")
  enabled: boolean;
  syncMode: TwentyCrmSyncMode;
  updatedBy: string | null;
  updatedAt: Date;
}

/**
 * Request payload for creating/updating Twenty CRM config
 */
export interface UpdateTwentyCrmConfigRequest {
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
  syncMode: TwentyCrmSyncMode;
}

/**
 * Response from environment variables (defaults)
 */
export interface TwentyCrmEnvConfig {
  baseUrl?: string;
  apiKey?: string;
  enabled: boolean;
  syncMode: TwentyCrmSyncMode;
}
