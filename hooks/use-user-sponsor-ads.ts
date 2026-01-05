import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounceValue } from "@/hooks/use-debounced-value";
import { serverClient, apiUtils } from "@/lib/api/server-api-client";
import type { SponsorAdStatus, SponsorAdStats } from "@/lib/types/sponsor-ad";
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

interface UserSponsorAdsStatsResponse {
	success: boolean;
	stats: SponsorAdStats;
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
	search?: string;
}

interface UseUserSponsorAdsReturn {
	// Data
	sponsorAds: SponsorAd[];
	stats: SponsorAdStats;

	// Loading states
	isLoading: boolean;
	isFetching: boolean;
	isStatsLoading: boolean;
	isCreating: boolean;

	// Pagination
	currentPage: number;
	totalPages: number;
	totalItems: number;

	// Filters
	statusFilter: SponsorAdStatus | undefined;
	search: string;
	isSearching: boolean;

	// Actions
	createSponsorAd: (input: CreateSponsorAdInput) => Promise<SponsorAd | null>;
	cancelSponsorAd: (id: string) => Promise<boolean>;

	// Filter actions
	setStatusFilter: (status: SponsorAdStatus | undefined) => void;
	setSearch: (search: string) => void;
	setCurrentPage: (page: number) => void;
	nextPage: () => void;
	prevPage: () => void;

	// Utility
	refreshData: () => void;
}

// ######################### Query Keys #########################

const userSponsorAdsQueryKeys = {
	all: ["user-sponsor-ads"] as const,
	lists: () => [...userSponsorAdsQueryKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...userSponsorAdsQueryKeys.lists(), filters] as const,
	stats: () => [...userSponsorAdsQueryKeys.all, "stats"] as const,
};

// ######################### API Functions #########################

const fetchUserSponsorAds = async (
	params: UseUserSponsorAdsOptions & { search?: string }
): Promise<UserSponsorAdsResponse> => {
	const searchParams = new URLSearchParams();

	if (params.page) searchParams.set('page', params.page.toString());
	if (params.limit) searchParams.set('limit', params.limit.toString());
	if (params.status) searchParams.set('status', params.status);
	if (params.search) searchParams.set('search', params.search);

	const response = await serverClient.get<UserSponsorAdsResponse>(
		`/api/sponsor-ads/user?${searchParams.toString()}`
	);

	if (!apiUtils.isSuccess(response)) {
		throw new Error(apiUtils.getErrorMessage(response));
	}

	return response.data;
};

const fetchUserSponsorAdsStats = async (): Promise<UserSponsorAdsStatsResponse> => {
	const response = await serverClient.get<UserSponsorAdsStatsResponse>(
		'/api/sponsor-ads/user/stats'
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

// Default empty stats
const defaultStats: SponsorAdStats = {
	overview: {
		total: 0,
		pendingPayment: 0,
		pending: 0,
		active: 0,
		rejected: 0,
		expired: 0,
		cancelled: 0,
	},
	byInterval: {
		weekly: 0,
		monthly: 0,
	},
	revenue: {
		totalRevenue: 0,
		weeklyRevenue: 0,
		monthlyRevenue: 0,
	},
};

export function useUserSponsorAds(
	options: UseUserSponsorAdsOptions = {}
): UseUserSponsorAdsReturn {
	const {
		page: initialPage = 1,
		limit = 10,
		status: initialStatus,
		search: initialSearch = "",
	} = options;

	// State for filters
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [statusFilter, setStatusFilter] = useState<SponsorAdStatus | undefined>(
		initialStatus
	);
	const [search, setSearch] = useState(initialSearch);

	// Debounce search value
	const debouncedSearch = useDebounceValue(search, 300);
	const isSearching = search !== debouncedSearch;

	// Query client for cache management
	const queryClient = useQueryClient();

	// Query parameters
	const queryParams = useMemo(() => ({
		page: currentPage,
		limit,
		status: statusFilter,
		search: debouncedSearch || undefined,
	}), [currentPage, limit, statusFilter, debouncedSearch]);

	// Fetch user's sponsor ads
	const { data: sponsorAdsData, isLoading, isFetching } = useQuery({
		queryKey: userSponsorAdsQueryKeys.list(queryParams),
		queryFn: () => fetchUserSponsorAds(queryParams),
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch user's sponsor ads stats (separate query for independent refresh)
	const { data: statsData, isLoading: isStatsLoading } = useQuery({
		queryKey: userSponsorAdsQueryKeys.stats(),
		queryFn: fetchUserSponsorAdsStats,
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
	const stats = statsData?.stats || defaultStats;
	const isCreating = createMutation.isPending;
	const totalPages = sponsorAdsData?.pagination.totalPages || 1;
	const totalItems = sponsorAdsData?.pagination.total || 0;

	// Refresh data
	const refreshData = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: userSponsorAdsQueryKeys.all });
	}, [queryClient]);

	// Pagination helpers
	const nextPage = useCallback(() => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	}, [currentPage, totalPages]);

	const prevPage = useCallback(() => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	}, [currentPage]);

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
		stats,

		// Loading states
		isLoading,
		isFetching,
		isStatsLoading,
		isCreating,

		// Pagination
		currentPage,
		totalPages,
		totalItems,

		// Filters
		statusFilter,
		search,
		isSearching,

		// Actions
		createSponsorAd: handleCreate,
		cancelSponsorAd: handleCancel,

		// Filter actions
		setStatusFilter,
		setSearch,
		setCurrentPage,
		nextPage,
		prevPage,

		// Utility
		refreshData,
	};
}
