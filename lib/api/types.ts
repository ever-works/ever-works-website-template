import { AxiosError, AxiosRequestConfig } from 'axios';

export type ApiEndpoint = string;

export type QueryParams = Readonly<Record<string, string | number | boolean | undefined>>;

export type RequestBody = Readonly<Record<string, unknown>>;

export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sort?: string;
  readonly order?: 'asc' | 'desc';
}

export interface PaginatedMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface PaginatedResponse<T> {
  readonly data: ReadonlyArray<T>;
  readonly meta: PaginatedMeta;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message: string;
}

export interface ErrorResponse {
  readonly message: string;
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface ApiClientConfig extends Partial<AxiosRequestConfig> {
  readonly baseURL?: string;
  readonly timeout?: number;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface ApiError extends Error {
  readonly code?: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly status?: number;
}

export type ApiErrorHandler = (error: AxiosError) => never;
export type ApiResponseInterceptor = (error: AxiosError) => Promise<never>; 