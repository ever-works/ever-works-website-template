'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useActiveSponsorAds } from '@/hooks/use-active-sponsor-ads';
import type { SponsorAd } from '@/lib/db/schema';

// ######################### Types #########################

interface SponsorAdsContextValue {
	sponsors: SponsorAd[];
	isLoading: boolean;
	isError: boolean;
}

// ######################### Context #########################

const SponsorAdsContext = createContext<SponsorAdsContextValue | null>(null);

// ######################### Provider #########################

interface SponsorAdsProviderProps {
	children: ReactNode;
	limit?: number;
}

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
