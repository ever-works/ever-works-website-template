import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { API_CONSTANTS } from './constants';
import type {
    ApiEndpoint,
    QueryParams,
    RequestBody,
    PaginationParams,
    PaginatedResponse,
    ApiResponse,
    ErrorResponse,
    ApiClientConfig,
    ApiError,
    ApiResponseInterceptor
} from './types';

export class ApiClient {
  private readonly client: AxiosInstance;

  constructor(config: ApiClientConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || env.API_BASE_URL,
      timeout: config.timeout || env.API_TIMEOUT,
      headers: {
        'Content-Type': API_CONSTANTS.HEADERS.CONTENT_TYPE,
        'Accept': API_CONSTANTS.HEADERS.ACCEPT,
        ...config.headers
      },
      withCredentials: true,
      ...config
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      this.handleResponseError
    );
  }

  private handleResponseError: ApiResponseInterceptor = async (error) => {
    if (error.response?.status === API_CONSTANTS.STATUS.UNAUTHORIZED) {
      if (typeof window !== 'undefined') {
        window.location.href = env.AUTH_ENDPOINT_LOGIN;
      }
    }
    throw this.formatError(error);
  };

  private formatError(error: unknown): ApiError {
    if (error instanceof AxiosError && error.response?.data) {
      const { message, code, details } = error.response.data as ErrorResponse;
      const formattedError = new Error(message) as ApiError;
      Object.assign(formattedError, {
        code,
        details,
        status: error.response.status
      });
      return formattedError;
    }
    return new Error(API_CONSTANTS.DEFAULT_ERROR_MESSAGE) as ApiError;
  }

  public async get<T>(
    endpoint: ApiEndpoint,
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(endpoint, {
      params,
      ...config
    });
    return response.data.data;
  }

  public async post<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(endpoint, data, config);
    return response.data.data;
  }

  public async put<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(endpoint, data, config);
    return response.data.data;
  }

  public async patch<T>(
    endpoint: ApiEndpoint,
    data?: RequestBody,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(endpoint, data, config);
    return response.data.data;
  }

  public async delete<T>(
    endpoint: ApiEndpoint,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(endpoint, config);
    return response.data.data;
  }

  public async getPaginated<T>(
    endpoint: ApiEndpoint,
    params: PaginationParams & QueryParams = {}
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(endpoint, { params });
    return response.data;
  }
} 