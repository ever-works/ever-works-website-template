'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
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
	items: ItemData[];
	limit?: number;
}

export function SponsorAdsProvider({ children, items, limit = 10 }: SponsorAdsProviderProps) {
	const { sponsors, isLoading, isError } = useActiveSponsorAds({ limit });

	// Create a map for fast item lookup by slug
	const itemsMap = useMemo(() => {
		const map = new Map<string, ItemData>();
		items.forEach((item) => map.set(item.slug, item));
		return map;
	}, [items]);

	// Merge sponsors with their item data
	const sponsorsWithItems = useMemo(() => {
		return sponsors.map((sponsor) => ({
			sponsor,
			item: itemsMap.get(sponsor.itemSlug) || null,
		}));
	}, [sponsors, itemsMap]);

	return (
		<SponsorAdsContext.Provider value={{ sponsors: sponsorsWithItems, isLoading, isError }}>
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
