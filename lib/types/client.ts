// ######################### Client Types #########################

export interface ClientData {
  id: string;
  userId: string;
  companyName?: string;
  clientType: 'individual' | 'business' | 'enterprise';
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  jobTitle?: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  plan: 'free' | 'standard' | 'premium';
  trialStartDate?: Date;
  trialEndDate?: Date;
  totalSubmissions: number;
  lastActivityAt?: Date;
  preferredContactMethod: 'email' | 'phone' | 'chat';
  marketingConsent: boolean;
  notes?: string;
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
  companyName?: string;
  clientType: 'individual' | 'business' | 'enterprise';
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  jobTitle?: string;
  preferredContactMethod?: 'email' | 'phone' | 'chat';
  marketingConsent?: boolean;
  notes?: string;
}

export interface UpdateClientRequest {
  id: string;
  companyName?: string;
  clientType?: 'individual' | 'business' | 'enterprise';
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  jobTitle?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  plan?: 'free' | 'standard' | 'premium';
  preferredContactMethod?: 'email' | 'phone' | 'chat';
  marketingConsent?: boolean;
  notes?: string;
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
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  plan?: 'free' | 'standard' | 'premium';
  clientType?: 'individual' | 'business' | 'enterprise';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'companyName' | 'clientType' | 'status' | 'plan' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

// Client validation constants
export const CLIENT_VALIDATION = {
  COMPANY_NAME_MIN_LENGTH: 2,
  COMPANY_NAME_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  WEBSITE_MAX_LENGTH: 255,
  COUNTRY_MAX_LENGTH: 50,
  CITY_MAX_LENGTH: 50,
  JOB_TITLE_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 1000,
} as const; 