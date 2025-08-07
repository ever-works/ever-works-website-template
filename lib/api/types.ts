import type { AxiosRequestConfig } from 'axios';

// Improved API response types using discriminated unions
export type ApiResponse<T = any> = 
  | { success: true; data: T; total?: number; page?: number; limit?: number; totalPages?: number }
  | { success: false; error: string };

export type PaginatedResponse<T> = ApiResponse<T> & {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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