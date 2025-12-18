'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { serverClient, apiUtils } from '@/lib/api/server-api-client';

export interface AutoRenewalStatus {
	subscriptionId: string;
	autoRenewal: boolean;
	cancelAtPeriodEnd: boolean;
	endDate: string | null;
}

export interface UpdateAutoRenewalRequest {
	subscriptionId: string;
	enabled: boolean;
	paymentProvider?: string;
}

export interface UpdateAutoRenewalResponse {
	success: boolean;
	subscription: {
		id: string;
		autoRenewal: boolean;
		cancelAtPeriodEnd: boolean;
		endDate: string | null;
		[key: string]: any;
	};
	message: string;
}

interface AutoRenewalError extends Error {
	status?: number;
	code?: string;
}

/*
Query key for auto-renewal status
*/
export const AUTO_RENEWAL_QUERY_KEY = (subscriptionId: string) => ['auto-renewal', subscriptionId] as const;

/*
Cache configuration
*/
const CACHE_CONFIG = {
	STALE_TIME: 2 * 60 * 1000, // 2 minutes
	GC_TIME: 10 * 60 * 1000 // 10 minutes
} as const;

/*
Fetch auto-renewal status
*/
const fetchAutoRenewalStatus = async (subscriptionId: string): Promise<AutoRenewalStatus> => {
	const response = await serverClient.get<AutoRenewalStatus>(`/api/payment/${subscriptionId}`);

	if (!apiUtils.isSuccess(response)) {
		const error = new Error(apiUtils.getErrorMessage(response)) as AutoRenewalError;
		error.status = 'status' in response ? (response.status as number) : undefined;
		throw error;
	}

	return response.data;
};

const updateAutoRenewal = async ({
	subscriptionId,
	enabled,
	paymentProvider
}: UpdateAutoRenewalRequest): Promise<UpdateAutoRenewalResponse> => {
	const response = await serverClient.patch<UpdateAutoRenewalResponse>(`/api/payment/${subscriptionId}`, {
		enabled,
		...(paymentProvider && { paymentProvider })
	});

	if (!apiUtils.isSuccess(response)) {
		const error = new Error(apiUtils.getErrorMessage(response)) as AutoRenewalError;
		error.status = 'status' in response ? (response.status as number) : undefined;
		throw error;
	}

	return response.data;
};

/*
Main Hook
*/
export interface UseAutoRenewalOptions {
	subscriptionId: string;
	enabled?: boolean; // Whether to enable the query
	onSuccess?: (data: AutoRenewalStatus) => void;
	onError?: (error: AutoRenewalError) => void;
}

export interface UseAutoRenewalReturn {
	// Data
	autoRenewalStatus: AutoRenewalStatus | undefined;
	autoRenewal: boolean;
	cancelAtPeriodEnd: boolean;
	endDate: string | null;

	// Status
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
	error: AutoRenewalError | null;

	// Update status
	isUpdating: boolean;
	updateError: AutoRenewalError | null;
	isUpdateSuccess: boolean;

	// Actions
	refetch: () => void;
	updateAutoRenewal: (enabled: boolean, paymentProvider?: string) => void;
	updateAutoRenewalAsync: (enabled: boolean, paymentProvider?: string) => Promise<UpdateAutoRenewalResponse>;
	enableAutoRenewal: () => void;
	disableAutoRenewal: () => void;

	// Cache management
	invalidateCache: () => void;
	clearCache: () => void;
}

export function useAutoRenewal(options: UseAutoRenewalOptions): UseAutoRenewalReturn {
	const { subscriptionId, enabled = true, onSuccess, onError } = options;
	const queryClient = useQueryClient();

	// Query for fetching auto-renewal status
	const { data, isLoading, isError, error, refetch, isSuccess } = useQuery<AutoRenewalStatus, AutoRenewalError>({
		queryKey: AUTO_RENEWAL_QUERY_KEY(subscriptionId),
		queryFn: () => fetchAutoRenewalStatus(subscriptionId),
		enabled: enabled && !!subscriptionId,
		staleTime: CACHE_CONFIG.STALE_TIME,
		gcTime: CACHE_CONFIG.GC_TIME,
		retry: (failureCount, error) => {
			// Don't retry auth errors
			if (error.status === 401 || error.status === 403) {
				return false;
			}
			return failureCount < 3;
		}
	});

	// Handle onSuccess and onError callbacks
	useEffect(() => {
		if (isSuccess && data && onSuccess) {
			onSuccess(data);
		}
	}, [isSuccess, data, onSuccess]);

	useEffect(() => {
		if (isError && error && onError) {
			onError(error);
		}
	}, [isError, error, onError]);

	// Mutation for updating auto-renewal status
	const updateMutation = useMutation<UpdateAutoRenewalResponse, AutoRenewalError, UpdateAutoRenewalRequest>({
		mutationFn: updateAutoRenewal,
		onSuccess: (response, variables) => {
			// Optimistically update the cache
			queryClient.setQueryData<AutoRenewalStatus>(
				AUTO_RENEWAL_QUERY_KEY(subscriptionId),
				(oldData): AutoRenewalStatus => {
					if (!oldData) {
						return {
							subscriptionId,
							autoRenewal: variables.enabled,
							cancelAtPeriodEnd: !variables.enabled,
							endDate: null
						};
					}
					return {
						...oldData,
						autoRenewal: variables.enabled,
						cancelAtPeriodEnd: !variables.enabled
					};
				}
			);

			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
			queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
			queryClient.invalidateQueries({ queryKey: ['billing'] });

			// Show success toast
			toast.success(
				response.message ||
					(variables.enabled
						? 'Auto-renewal has been enabled successfully'
						: 'Auto-renewal has been disabled successfully')
			);
		},
		onError: (error) => {
			console.error('Error updating auto-renewal:', error);
			toast.error(error.message || 'Failed to update auto-renewal status');

			// Refetch to ensure data consistency
			refetch();
		}
	});

	// Derived values
	const autoRenewalStatus = data;
	const autoRenewal = data?.autoRenewal ?? true;
	const cancelAtPeriodEnd = data?.cancelAtPeriodEnd ?? false;
	const endDate = data?.endDate ?? null;

	// Actions
	const updateAutoRenewalAction = useCallback(
		(enabled: boolean, paymentProvider?: string) => {
			updateMutation.mutate({ subscriptionId, enabled, paymentProvider });
		},
		[subscriptionId, updateMutation]
	);

	const updateAutoRenewalAsyncAction = useCallback(
		async (enabled: boolean, paymentProvider?: string) => {
			return updateMutation.mutateAsync({ subscriptionId, enabled, paymentProvider });
		},
		[subscriptionId, updateMutation]
	);

	const enableAutoRenewalAction = useCallback(() => {
		updateAutoRenewalAction(true);
	}, [updateAutoRenewalAction]);

	const disableAutoRenewalAction = useCallback(() => {
		updateAutoRenewalAction(false);
	}, [updateAutoRenewalAction]);

	const invalidateCache = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: AUTO_RENEWAL_QUERY_KEY(subscriptionId) });
	}, [queryClient, subscriptionId]);

	const clearCache = useCallback(() => {
		queryClient.removeQueries({ queryKey: AUTO_RENEWAL_QUERY_KEY(subscriptionId) });
	}, [queryClient, subscriptionId]);

	return {
		// Data
		autoRenewalStatus,
		autoRenewal,
		cancelAtPeriodEnd,
		endDate,

		// Status
		isLoading,
		isError,
		isSuccess,
		error: error || null,

		// Update status
		isUpdating: updateMutation.isPending,
		updateError: updateMutation.error || null,
		isUpdateSuccess: updateMutation.isSuccess,

		// Actions
		refetch,
		updateAutoRenewal: updateAutoRenewalAction,
		updateAutoRenewalAsync: updateAutoRenewalAsyncAction,
		enableAutoRenewal: enableAutoRenewalAction,
		disableAutoRenewal: disableAutoRenewalAction,

		// Cache management
		invalidateCache,
		clearCache
	};
}
