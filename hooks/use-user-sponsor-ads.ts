import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serverClient, apiUtils } from "@/lib/api/server-api-client";
import type { SponsorAdStatus } from "@/lib/types/sponsor-ad";
import type { SponsorAd } from "@/lib/db/schema";

// ######################### Types #########################

interface UserSponsorAdsResponse {
	success: boolean;
	data: SponsorAd[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

interface CreateSponsorAdResponse {
	success: boolean;
	data: SponsorAd;
	message?: string;
}

interface CreateSponsorAdInput {
	itemSlug: string;
	itemName: string;
	itemIconUrl?: string;
	itemCategory?: string;
	itemDescription?: string;
	interval: "weekly" | "monthly";
}

interface UseUserSponsorAdsOptions {
	page?: number;
	limit?: number;
	status?: SponsorAdStatus;
}

interface UseUserSponsorAdsReturn {
	// Data
	sponsorAds: SponsorAd[];

	// Loading states
	isLoading: boolean;
	isCreating: boolean;

	// Pagination
	currentPage: number;
	totalPages: number;
	totalItems: number;

	// Filters
	statusFilter: SponsorAdStatus | undefined;

	// Actions
	createSponsorAd: (input: CreateSponsorAdInput) => Promise<SponsorAd | null>;
	cancelSponsorAd: (id: string) => Promise<boolean>;

	// Filter actions
	setStatusFilter: (status: SponsorAdStatus | undefined) => void;
	setCurrentPage: (page: number) => void;

	// Utility
	refreshData: () => void;
}

// ######################### Query Keys #########################

const userSponsorAdsQueryKeys = {
	all: ["user-sponsor-ads"] as const,
	lists: () => [...userSponsorAdsQueryKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...userSponsorAdsQueryKeys.lists(), filters] as const,
};

// ######################### API Functions #########################

const fetchUserSponsorAds = async (
	params: UseUserSponsorAdsOptions
): Promise<UserSponsorAdsResponse> => {
	const queryParams = apiUtils.createQueryString({
		page: params.page,
		limit: params.limit,
		status: params.status,
	});

	const response = await serverClient.get<UserSponsorAdsResponse>(
		`/api/sponsor-ads/user?${queryParams}`
	);

	if (!apiUtils.isSuccess(response)) {
		throw new Error(apiUtils.getErrorMessage(response));
	}

	return response.data;
};

const createSponsorAdApi = async (
	input: CreateSponsorAdInput
): Promise<CreateSponsorAdResponse> => {
	const response = await serverClient.post<CreateSponsorAdResponse>(
		"/api/sponsor-ads/user",
		input
	);

	if (!apiUtils.isSuccess(response)) {
		throw new Error(apiUtils.getErrorMessage(response));
	}

	return response.data;
};

const cancelSponsorAdApi = async (
	id: string
): Promise<{ success: boolean; message: string }> => {
	const response = await serverClient.post<{
		success: boolean;
		message: string;
	}>(`/api/sponsor-ads/user/${id}/cancel`, {});

	if (!apiUtils.isSuccess(response)) {
		throw new Error(apiUtils.getErrorMessage(response));
	}

	return response.data;
};

// ######################### Hook #########################

export function useUserSponsorAds(
	options: UseUserSponsorAdsOptions = {}
): UseUserSponsorAdsReturn {
	const {
		page: initialPage = 1,
		limit = 10,
		status: initialStatus,
	} = options;

	// State for filters
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [statusFilter, setStatusFilter] = useState<SponsorAdStatus | undefined>(
		initialStatus
	);

	// Query client for cache management
	const queryClient = useQueryClient();

	// Query parameters
	const queryParams = {
		page: currentPage,
		limit,
		status: statusFilter,
	};

	// Fetch user's sponsor ads
	const { data: sponsorAdsData, isLoading } = useQuery({
		queryKey: userSponsorAdsQueryKeys.list(queryParams),
		queryFn: () => fetchUserSponsorAds(queryParams),
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});

	// Mutations
	const createMutation = useMutation({
		mutationFn: createSponsorAdApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userSponsorAdsQueryKeys.all });
			toast.success("Sponsor ad submission created successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to create sponsor ad: ${error.message}`);
		},
	});

	const cancelMutation = useMutation({
		mutationFn: cancelSponsorAdApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userSponsorAdsQueryKeys.all });
			toast.success("Sponsor ad cancelled");
		},
		onError: (error: Error) => {
			toast.error(`Failed to cancel: ${error.message}`);
		},
	});

	// Derived data
	const sponsorAds = sponsorAdsData?.data || [];
	const isCreating = createMutation.isPending;
	const totalPages = sponsorAdsData?.pagination.totalPages || 1;
	const totalItems = sponsorAdsData?.pagination.total || 0;

	// Refresh data
	const refreshData = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: userSponsorAdsQueryKeys.all });
	}, [queryClient]);

	// Action handlers
	const handleCreate = useCallback(
		async (input: CreateSponsorAdInput): Promise<SponsorAd | null> => {
			try {
				const result = await createMutation.mutateAsync(input);
				return result.data;
			} catch {
				return null;
			}
		},
		[createMutation]
	);

	const handleCancel = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				await cancelMutation.mutateAsync(id);
				return true;
			} catch {
				return false;
			}
		},
		[cancelMutation]
	);

	return {
		// Data
		sponsorAds,

		// Loading states
		isLoading,
		isCreating,

		// Pagination
		currentPage,
		totalPages,
		totalItems,

		// Filters
		statusFilter,

		// Actions
		createSponsorAd: handleCreate,
		cancelSponsorAd: handleCancel,

		// Filter actions
		setStatusFilter,
		setCurrentPage,

		// Utility
		refreshData,
	};
}
