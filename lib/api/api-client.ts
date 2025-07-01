import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../config/env';

// API Response and Error Types
export type ApiEndpoint = string;
export type QueryParams = Record<string, string | number | boolean | undefined>;
export type RequestBody = Record<string, unknown>;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
}

// Storage Keys and Constants
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRY: 'auth_token_expiry'
} as const;

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  onAuthError?: () => void;
  onError?: (error: Error) => void;
  authEndpoints?: {
    refresh: string;
    login: string;
    logout: string;
  };
}

// Interface for retryable request configuration
interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry: number;
}

/**
 * Generic API client with built-in support for:
 * - Authentication with token refresh
 * - Request/Response interceptors
 * - Error handling with custom callbacks
 * - Automatic retries with exponential backoff
 * - Pagination
 * - Type safety
 */
export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      headers: {},
      onAuthError: () => undefined,
      onError: () => undefined,
      authEndpoints: {
        refresh: '/auth/refresh',
        login: '/auth/login',
        logout: '/auth/logout'
      },
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers
      }
    });

    this.setupInterceptors();
  }

  /**
   * Generic CRUD methods with type safety
   */
  public async get<T>(
    endpoint: ApiEndpoint,
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(endpoint, { params, ...config });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async post<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async put<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async patch<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(
    endpoint: ApiEndpoint,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Paginated requests with proper typing
   */
  public async getPaginated<T>(
    endpoint: ApiEndpoint,
    params?: PaginationParams & QueryParams
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.client.get<PaginatedResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sets up request and response interceptors for authentication and error handling
   */
  private setupInterceptors(): void {
    // Request Interceptor - Adds authentication headers
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response Interceptor - Handles auth errors and retries
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (!error.config) {
          return Promise.reject(this.handleError(error));
        }

        const retryableRequest = error.config as RetryableRequestConfig;
        retryableRequest._retry = retryableRequest._retry || 0;

        // Handle authentication errors
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          if (retryableRequest._retry === 0) {
            retryableRequest._retry++;
            try {
              const newToken = await this.refreshToken();
              if (newToken && retryableRequest.headers) {
                retryableRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client(retryableRequest);
              }
            } catch (refreshError) {
              this.handleAuthError();
              return Promise.reject(this.handleError(refreshError));
            }
          } else {
            this.handleAuthError();
          }
        }

        // Handle retryable errors with exponential backoff
        if (this.shouldRetry(error) && retryableRequest._retry < this.config.retryAttempts) {
          retryableRequest._retry++;
          return this.retryRequest(retryableRequest);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Determines if a request should be retried based on the error type
   */
  private shouldRetry(error: AxiosError): boolean {
    return !!(
      error.code === 'ECONNABORTED' ||
      error.response?.status === HTTP_STATUS.SERVICE_UNAVAILABLE ||
      error.response?.status === HTTP_STATUS.GATEWAY_TIMEOUT ||
      error.response?.status === HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  /**
   * Implements exponential backoff retry strategy
   */
  private async retryRequest(config: RetryableRequestConfig): Promise<AxiosResponse> {
    const delay = this.config.retryDelay * Math.pow(2, config._retry - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.client(config);
  }

  /**
   * Formats errors into a consistent structure with additional metadata
   */
  private handleError(error: unknown): Error {
    const formattedError = this.formatError(error);
    this.config.onError(formattedError);
    return formattedError;
  }

  private formatError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ErrorResponse;
      const message = response?.message || error.message;
      const formattedError = new Error(message);
      Object.assign(formattedError, {
        code: response?.code || error.code,
        details: response?.details,
        status: error.response?.status,
        timestamp: response?.timestamp || new Date().toISOString(),
        path: response?.path || error.config?.url
      });
      return formattedError;
    }
    return error instanceof Error ? error : new Error('An unknown error occurred');
  }

  /**
   * Authentication token management
   */
  private handleAuthError(): void {
    this.clearAuthTokens();
    this.config.onAuthError();
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return null;

      const response = await this.post<{ token: string; expiresIn: number }>(
        this.config.authEndpoints.refresh,
        { refreshToken }
      );

      const { token, expiresIn } = response.data;
      this.setAuthToken(token, expiresIn);
      return token;
    } catch (error) {
      this.clearAuthTokens();
      throw error;
    }
  }

  private setAuthToken(token: string, expiresIn?: number): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    
    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    }
  }

  private clearAuthTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  }

  /**
   * Public method to check token expiration
   */
  public isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryTime) return true;
    return Date.now() >= parseInt(expiryTime, 10);
  }
} 


export const api = new ApiClient({
  baseURL: env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : env.API_BASE_URL,
});
