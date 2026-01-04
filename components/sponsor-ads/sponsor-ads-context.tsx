'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useActiveSponsorAds } from '@/hooks/use-active-sponsor-ads';
import type { SponsorAd } from '@/lib/db/schema';
import type { ItemData } from '@/lib/content';

// ######################### Types #########################

export interface SponsorWithItem {
	sponsor: SponsorAd;
	item: ItemData | null;
}

interface SponsorAdsContextValue {
	sponsors: SponsorWithItem[];
	isLoading: boolean;
	isError: boolean;
}

// ######################### Context #########################

const SponsorAdsContext = createContext<SponsorAdsContextValue | null>(null);

// ######################### Provider #########################

interface SponsorAdsProviderProps {
	children: ReactNode;
	/** @deprecated items prop is no longer needed - data is fetched with items from API */
	items?: ItemData[];
	limit?: number;
}

/**
 * Provider for sponsor ads context.
 * Note: The items prop is deprecated and no longer needed since the API now returns
 * sponsors with their associated item data (server-side join).
 */
export function SponsorAdsProvider({ children, limit = 10 }: SponsorAdsProviderProps) {
	const { sponsors, isLoading, isError } = useActiveSponsorAds({ limit });

	return (
		<SponsorAdsContext.Provider value={{ sponsors, isLoading, isError }}>
			{children}
		</SponsorAdsContext.Provider>
	);
}

// ######################### Hook #########################

export function useSponsorAdsContext(): SponsorAdsContextValue {
	const context = useContext(SponsorAdsContext);

	if (!context) {
		// Return empty state if not wrapped in provider (graceful fallback)
		return {
			sponsors: [],
			isLoading: false,
			isError: false,
		};
	}

	return context;
}
