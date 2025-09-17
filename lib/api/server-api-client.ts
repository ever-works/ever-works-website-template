/**
 * Server-side API client for making HTTP requests
 * Provides a centralized way to handle API calls with proper error handling
 */

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Default configuration
const DEFAULT_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'EverWorks-Server/1.0',
  },
};

/**
 * Enhanced fetch with timeout, retries, and error handling
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    retries = DEFAULT_CONFIG.retries,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    ...fetchOptions
  } = options;

  const attemptFetch = async (attempt: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...DEFAULT_CONFIG.headers,
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle AbortError specifically
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      if (attempt < retries && !controller.signal.aborted) {
        console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return attemptFetch(attempt + 1);
      }

      throw error;
    }
  };

  return attemptFetch(0);
}

/**
 * Main server client class
 */
export class ServerClient {
  private baseUrl: string;
  private defaultOptions: FetchOptions;

  constructor(baseUrl: string = '', options: FetchOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = { ...DEFAULT_CONFIG, ...options };
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      const response = await fetchWithTimeout(url, mergedOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with form data
   */
  async upload<T>(
    endpoint: string,
    file: File | FormData,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        ...Object.fromEntries(
          Object.entries(options.headers || {}).filter(
            ([key]) => key.toLowerCase() !== 'content-type'
          )
        ),
      },
    });
  }

  /**
   * Send form data (URL encoded)
   */
  async postForm<T>(
    endpoint: string,
    data: Record<string, string>,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const formData = new URLSearchParams(data);

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData.toString(),
      headers: {
        ...options.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}

// Default instance for immediate use
export const serverClient = new ServerClient();

// Specialized clients for different services
export const createApiClient = (baseUrl: string, options?: FetchOptions) => {
  return new ServerClient(baseUrl, options);
};

// ReCAPTCHA specific client
export const recaptchaClient = {
  async verify(token: string): Promise<ApiResponse<any>> {
    return serverClient.post('/api/verify-recaptcha', { token });
  },
};

// External API client (for third-party services)
export const externalClient = new ServerClient('', {
  timeout: 15000, // Longer timeout for external APIs
  retries: 2,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility functions
export const apiUtils = {
  /**
   * Check if response is successful
   */
  isSuccess: <T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } => {
    return response.success && response.data !== undefined;
  },

  /**
   * Extract error message from response
   */
  getErrorMessage: (response: ApiResponse<any>): string => {
    return response.error || response.message || 'Unknown error occurred';
  },

  /**
   * Create query string from object
   */
  createQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },

  /**
   * Build URL with query parameters
   */
  buildUrl: (baseUrl: string, params?: Record<string, any>): string => {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }
    const queryString = apiUtils.createQueryString(params);
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
  },
};