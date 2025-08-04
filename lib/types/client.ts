// ######################### Client Types #########################

export interface ClientData {
  id: string;
  userId: string;
  displayName?: string;
  username?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  phone?: string;
  website?: string;
  location?: string;
  accountType: 'individual' | 'team' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'trial' | 'cancelled';
  plan: 'free' | 'standard' | 'premium';
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  totalSubmissions: number;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  notes?: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientWithUser extends ClientData {
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
    createdAt: Date;
  };
}

export interface CreateClientRequest {
  userId: string;
  displayName?: string;
  username?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  phone?: string;
  website?: string;
  location?: string;
  accountType?: 'individual' | 'team' | 'enterprise';
  timezone?: string;
  language?: string;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  notes?: string;
  tags?: string;
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
  accountType?: 'individual' | 'team' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'trial' | 'cancelled';
  plan?: 'free' | 'standard' | 'premium';
  timezone?: string;
  language?: string;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  notes?: string;
  tags?: string;
}

export interface ClientListResponse {
  success: boolean;
  clients?: ClientWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

export interface ClientResponse {
  success: boolean;
  client?: ClientWithUser;
  error?: string;
  message?: string;
}

export interface ClientListOptions {
  status?: 'active' | 'inactive' | 'suspended' | 'trial' | 'cancelled';
  plan?: 'free' | 'standard' | 'premium';
  accountType?: 'individual' | 'team' | 'enterprise';
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