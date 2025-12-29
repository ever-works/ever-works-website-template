'use client';

import { serverClient, apiUtils } from '@/lib/api/server-api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

// Constants
const DEFAULT_CURRENCY = 'USD' as const;
const CURRENCY_QUERY_KEY = ['user-currency'] as const;

// Types
interface CurrencyResponse {
	currency: string;
}

export interface UpdateCurrencyOptions {
	onSuccess?: (currency: string) => void;
	onError?: (error: Error) => void;
}

/**
 * Validates if a currency code is valid (3 uppercase letters)
 */
function isValidCurrencyCode(currency: string): boolean {
	return /^[A-Z]{3}$/.test(currency);
}

/**
 * Normalizes currency code to uppercase
 */
function normalizeCurrency(currency: string): string {
	return currency.trim().toUpperCase();
}

/**
 * Fetch user currency from API
 * @throws {Error} If the API request fails
 */
async function fetchUserCurrency(): Promise<string> {
	const response = await serverClient.get<CurrencyResponse>('/api/user/currency');

	if (!apiUtils.isSuccess(response)) {
		throw new Error(apiUtils.getErrorMessage(response) || 'Failed to fetch currency');
	}

	const currency = response.data.currency;
	return normalizeCurrency(currency || DEFAULT_CURRENCY);
}

/**
 * Hook to get and manage user currency
 *
 * @returns Currency state and update function
 * @throws {Error} If the API request fails
 * @example
 * ```tsx
 * const { currency, updateCurrency, isLoading, isError } = useCurrency();
 *
 * // Update currency
 * updateCurrency('EUR', {
 *   onSuccess: (newCurrency) => console.log(`Currency updated to ${newCurrency}`),
 *   onError: (error) => console.error('Failed to update currency:', error)
 * });
 * ```
 *
 */
export function useCurrency() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const isAuthenticated = !!session?.user?.id;

	const {
		data: currency = DEFAULT_CURRENCY,
		isLoading,
		isError,
		error,
		refetch
	} = useQuery<string>({
		queryKey: CURRENCY_QUERY_KEY,
		queryFn: fetchUserCurrency,
		enabled: isAuthenticated,
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		retry: (failureCount, error) => {
			// Retry up to 2 times for network errors, but not for 4xx errors
			if (failureCount >= 2) return false;
			if (error instanceof Error && 'status' in error) {
				const status = (error as any).status;
				return status >= 500 || status === 0; // Retry on server errors or network failures
			}
			return true;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
		refetchOnWindowFocus: false,
		refetchOnReconnect: true
	});

	const updateCurrencyMutation = useMutation({
		mutationFn: async (newCurrency: string): Promise<string> => {
			const normalizedCurrency = normalizeCurrency(newCurrency);

			// Validate currency format
			if (!isValidCurrencyCode(normalizedCurrency)) {
				throw new Error(`Invalid currency code: ${newCurrency}. Expected 3 uppercase letters (e.g., USD, EUR)`);
			}

			const response = await serverClient.put<CurrencyResponse>('/api/user/currency', {
				currency: normalizedCurrency
			});

			if (!apiUtils.isSuccess(response)) {
				throw new Error(apiUtils.getErrorMessage(response) || 'Failed to update currency');
			}

			return normalizedCurrency;
		},
		onMutate: async (newCurrency) => {
			// Cancel outgoing refetches to avoid overwriting optimistic update
			await queryClient.cancelQueries({ queryKey: CURRENCY_QUERY_KEY });

			// Snapshot the previous value for rollback
			const previousCurrency = queryClient.getQueryData<string>(CURRENCY_QUERY_KEY);

			// Optimistically update to the new value
			const normalizedCurrency = normalizeCurrency(newCurrency);
			queryClient.setQueryData(CURRENCY_QUERY_KEY, normalizedCurrency);

			// Return context with the previous value
			return { previousCurrency };
		},
		onError: (error, _newCurrency, context) => {
			// Rollback to previous value on error
			if (context?.previousCurrency) {
				queryClient.setQueryData(CURRENCY_QUERY_KEY, context.previousCurrency);
			}
		},
		onSuccess: (newCurrency) => {
			// Ensure the cache is updated with the normalized value
			queryClient.setQueryData(CURRENCY_QUERY_KEY, newCurrency);
			// Optionally invalidate related queries if needed
			queryClient.invalidateQueries({ queryKey: CURRENCY_QUERY_KEY });
		},
		onSettled: () => {
			// Always refetch after mutation to ensure consistency
			queryClient.invalidateQueries({ queryKey: CURRENCY_QUERY_KEY });
		}
	});

	/**
	 * Update user currency preference
	 *
	 * @param newCurrency - The new currency code (e.g., 'USD', 'EUR')
	 * @param options - Optional callbacks for success/error handling
	 */
	const updateCurrency = useCallback(
		(newCurrency: string, options?: UpdateCurrencyOptions) => {
			updateCurrencyMutation.mutate(newCurrency, {
				onSuccess: (currency) => {
					options?.onSuccess?.(currency);
				},
				onError: (error) => {
					options?.onError?.(error);
				}
			});
		},
		[updateCurrencyMutation]
	);

	return {
		currency,
		isLoading,
		isError,
		error: error instanceof Error ? error : isError ? new Error('Failed to fetch currency') : null,
		updateCurrency,
		isUpdating: updateCurrencyMutation.isPending,
		refetch
	};
}
