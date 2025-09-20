import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError, RequestBody } from '@/lib/api/api-client';
import { toast } from 'sonner';

interface MutationConfig<TData, TVariables extends RequestBody, TContext = unknown> extends Omit<
  UseMutationOptions<TData, ApiError, TVariables, TContext>,
  'mutationFn' | 'onSuccess' | 'onError'
> {
  endpoint: string;
  method: 'post' | 'put' | 'patch' | 'delete';
  successMessage?: string;
  invalidateQueries?: string[];
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: ApiError, variables: TVariables) => void | Promise<void>;
}

export function useMutationWithToast<TData, TVariables extends RequestBody = RequestBody, TContext = unknown>({
  endpoint,
  method,
  successMessage,
  invalidateQueries = [],
  onSuccess,
  onError,
  ...options
}: MutationConfig<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables, TContext>({
    mutationFn: async (variables) => {
      switch (method) {
        case 'post':
          return apiClient.post<TData>(endpoint, variables);
        case 'put':
          return apiClient.put<TData>(endpoint, variables);
        case 'patch':
          return apiClient.patch<TData>(endpoint, variables);
        case 'delete':
          return apiClient.delete<TData>(endpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: async (data, variables) => {
      await Promise.all(
        invalidateQueries.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );

      if (successMessage) {
        toast.success(successMessage);
      }
      await onSuccess?.(data, variables);
    },
    onError: async (error, variables) => {
      toast.error(error.message || 'An error occurred');
      await onError?.(error, variables);
    },
    ...options,
  });
} 