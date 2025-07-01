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

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// Client Configuration
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  withCredentials?: boolean;
  onAuthError?: () => void;
  onError?: (error: Error) => void;
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
  private static instance: ApiClient | null = null;
  private readonly client: AxiosInstance;
  private readonly config: Required<ApiClientConfig>;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || env.API_BASE_URL,
      timeout: config.timeout || env.API_TIMEOUT,
      retryAttempts: config.retryAttempts || env.API_RETRY_ATTEMPTS,
      retryDelay: config.retryDelay || env.API_RETRY_DELAY,
      headers: config.headers || {},
      withCredentials: config.withCredentials ?? true,
      onAuthError: config.onAuthError || (() => {
        if (typeof window !== 'undefined') {
          window.location.href = env.AUTH_ENDPOINT_LOGIN;
        }
      }),
      onError: config.onError || console.error,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers
      },
      withCredentials: this.config.withCredentials
    });

    this.setupInterceptors();
  }

  /**
   * Get the singleton instance of ApiClient
   */
  public static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  /**
   * Reset the singleton instance
   * Useful for testing or reconfiguring the client
   */
  public static resetInstance(): void {
    ApiClient.instance = null;
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
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => config, // Les cookies gèrent l'authentification
      (error) => Promise.reject(this.handleError(error))
    );

    // Response Interceptor
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
            
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              
              try {
                await this.refreshToken();
                this.refreshSubscribers.forEach(callback => callback('refreshed'));
                this.refreshSubscribers = [];
                return this.client(retryableRequest);
              } catch (refreshError) {
                this.refreshSubscribers = [];
                this.handleAuthError();
                return Promise.reject(this.handleError(refreshError));
              } finally {
                this.isRefreshing = false;
              }
            } else {
              // Queue the retry if a refresh is already in progress
              return new Promise(resolve => {
                this.refreshSubscribers.push(() => {
                  resolve(this.client(retryableRequest));
                });
              });
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
    this.config.onAuthError();
  }

  /**
   * Check if user is authenticated by calling the check endpoint
   * This replaces the token expiry check since we're using httpOnly cookies
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      await this.get(env.AUTH_ENDPOINT_CHECK);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
        return false;
      }
      throw this.handleError(error);
    }
  }

  private async refreshToken(): Promise<void> {
    await this.post(env.AUTH_ENDPOINT_REFRESH);
  }

  /**
   * Login method that sets httpOnly cookies
   */
  public async login(credentials: { email: string; password: string }): Promise<void> {
    await this.post(env.AUTH_ENDPOINT_LOGIN, credentials);
  }

  /**
   * Logout method that clears httpOnly cookies
   */
  public async logout(): Promise<void> {
    await this.post(env.AUTH_ENDPOINT_LOGOUT);
  }
}

// Export the default instance using the singleton manager
export { getDefaultClient as api, createCustomClient } from './singleton';
