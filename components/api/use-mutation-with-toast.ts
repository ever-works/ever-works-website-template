import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError, RequestBody } from '@/lib/api/api-client';
import { toast } from 'sonner';

interface MutationConfig<TData, TVariables extends RequestBody> extends Omit<
  UseMutationOptions<TData, ApiError, TVariables, unknown>,
  'mutationFn'
> {
  endpoint: string;
  method: 'post' | 'put' | 'patch' | 'delete';
  successMessage?: string;
  invalidateQueries?: string[];
}

export function useMutationWithToast<TData, TVariables extends RequestBody = RequestBody>({
  endpoint,
  method,
  successMessage,
  invalidateQueries = [],
  onSuccess,
  onError,
  ...options
}: MutationConfig<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables, unknown>({
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
    onSuccess: async (data, variables, context, mutation) => {
      await Promise.all(
        invalidateQueries.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );

      if (successMessage) {
        toast.success(successMessage);
      }

      await onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      toast.error(error.message || 'An error occurred');
      onError?.(error, variables, context, mutation);
    },
    ...options,
  });
} 