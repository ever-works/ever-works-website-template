// ######################### Client Types #########################

import type { ClientProfileWithUser } from '@/lib/db/schema';

export interface CreateClientRequest {
  /** @deprecated use `email` instead */
  userId?: string;
  email: string;
  displayName?: string;
  username?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  phone?: string;
  website?: string;
  location?: string;
  accountType?: 'individual' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  plan?: 'free' | 'standard' | 'premium';
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  totalSubmissions?: number;
}

export interface UpdateClientRequest {
  id: string;
  displayName?: string;
  username?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  phone?: string;
  website?: string;
  location?: string;
  accountType?: 'individual' | 'business' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  plan?: 'free' | 'standard' | 'premium';
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
}



// Client-specific response types using the shared PaginatedResponse
export type ClientListResponse = 
  | {
      success: true;
      data: { clients: ClientProfileWithUser[] };
      meta: {
        page: number;
        totalPages: number;
        total: number;
        limit: number;
      };
    }
  | { success: false; error: string };

export type ClientResponse = 
  | {
      success: true;
      data: ClientProfileWithUser;
    }
  | { success: false; error: string };

export interface ClientListOptions {
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  plan?: 'free' | 'standard' | 'premium';
  accountType?: 'individual' | 'business' | 'enterprise';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'displayName' | 'username' | 'accountType' | 'status' | 'plan' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

// Client validation constants
export const CLIENT_VALIDATION = {
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 100,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  BIO_MAX_LENGTH: 500,
  JOB_TITLE_MAX_LENGTH: 100,
  COMPANY_MAX_LENGTH: 100,
  INDUSTRY_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  WEBSITE_MAX_LENGTH: 255,
  LOCATION_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 1000,
  TAGS_MAX_LENGTH: 500,
} as const; 