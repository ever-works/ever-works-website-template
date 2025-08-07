import type { AxiosRequestConfig } from 'axios';

// API endpoint types
export type ApiEndpoint = string;

// Request/Response types
export type QueryParams = Record<string, any>;
export type RequestBody = any;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response interceptor type
export type ApiResponseInterceptor = (error: any) => Promise<never>;

// Improved API response types using discriminated unions
export type ApiResponse<T = any> = 
  | { success: true; data: T; total?: number; page?: number; limit?: number; totalPages?: number }
  | { success: false; error: string };

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
};

export interface ApiClientConfig extends Partial<AxiosRequestConfig> {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
} 