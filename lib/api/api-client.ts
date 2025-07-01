import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Generic API types
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

// Client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  onAuthError?: () => void;
  onError?: (error: Error) => void;
}

// Interface for retryable request configuration
interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry: number;
}

/**
 * Generic API client with built-in support for:
 * - Authentication
 * - Request/Response interceptors
 * - Error handling
 * - Automatic retries
 * - Pagination
 * - Type safety
 */
export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly config: ApiClientConfig;

  /**
   * Creates a new API client instance
   * @param config - Client configuration options
   */
  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000, // Default timeout: 10 seconds
      retryAttempts: 3,
      retryDelay: 1000,
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
   * Generic CRUD methods for API operations
   * These protected methods can be used by extending classes to implement specific endpoints
   */
  protected async get<T>(
    endpoint: ApiEndpoint,
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(endpoint, { 
      params,
      ...config
    });
    return response.data;
  }

  protected async post<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  }

  protected async put<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  }

  protected async patch<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  }

  protected async delete<T>(
    endpoint: ApiEndpoint,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(endpoint, config);
    return response.data;
  }

  /**
   * Generic method for paginated requests
   * Handles standard pagination parameters and returns typed response
   */
  protected async getPaginated<T>(
    endpoint: ApiEndpoint,
    params?: PaginationParams & QueryParams
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(endpoint, { params });
    return response.data;
  }

  /**
   * Sets up request and response interceptors for authentication and error handling
   */
  private setupInterceptors(): void {
    // Request Interceptor - Adds authentication headers
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
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
        if (error.response?.status === 401) {
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

        // Handle network or server errors with retry
        if (this.shouldRetry(error) && retryableRequest._retry < (this.config.retryAttempts || 3)) {
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
    return (
      error.code === 'ECONNABORTED' ||
      error.response?.status === 503 ||
      error.response?.status === 504 ||
      error.response?.status === 429 // Rate limiting
    );
  }

  /**
   * Implements exponential backoff retry strategy
   */
  private async retryRequest(config: RetryableRequestConfig): Promise<AxiosResponse> {
    const delay = this.config.retryDelay! * config._retry;
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.client(config);
  }

  /**
   * Formats errors into a consistent structure with additional metadata
   */
  private handleError(error: unknown): Error {
    const formattedError = this.formatError(error);
    if (this.config.onError) {
      this.config.onError(formattedError);
    }
    return formattedError;
  }

  private formatError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ErrorResponse;
      const message = response?.message || error.message;
      const formattedError = new Error(message);
      Object.assign(formattedError, {
        code: response?.code,
        details: response?.details,
        status: error.response?.status,
        timestamp: response?.timestamp,
        path: response?.path
      });
      return formattedError;
    }
    return error instanceof Error ? error : new Error('An unknown error occurred');
  }

  /**
   * Handles authentication errors by clearing tokens and triggering callback
   */
  private handleAuthError(): void {
    this.clearAuthTokens();
    if (this.config.onAuthError) {
      this.config.onAuthError();
    }
  }

  /**
   * Authentication token management methods
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await this.post<{ token: string }>('/auth/refresh', {
        refreshToken
      });

      const newToken = response.data.token;
      this.setAuthToken(newToken);
      return newToken;
    } catch (error) {
      this.clearAuthTokens();
      throw error;
    }
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearAuthTokens(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

 

  /**
   * Generic method for custom requests that don't fit the standard CRUD pattern
   */
  public async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data;
  }
} 