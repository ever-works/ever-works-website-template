'use client';

import { useState, useCallback, useMemo } from 'react';

export type ItemStatusFilter = '' | 'draft' | 'pending' | 'approved' | 'rejected';

export interface ItemFilters {
	searchTerm: string;
	statusFilter: ItemStatusFilter;
	categoryFilter: string;
}

export interface UseItemFiltersReturn {
	// State
	searchTerm: string;
	statusFilter: ItemStatusFilter;
	categoryFilter: string;
	activeFilterCount: number;

	// Setters
	setSearchTerm: (value: string) => void;
	setStatusFilter: (value: ItemStatusFilter) => void;
	setCategoryFilter: (value: string) => void;

	// Actions
	clearFilters: () => void;
}

/**
 * Custom hook for managing item filter state
 * Following the pattern from use-client-filters.ts
 */
export function useItemFilters(): UseItemFiltersReturn {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<ItemStatusFilter>('');
	const [categoryFilter, setCategoryFilter] = useState('');

	const clearFilters = useCallback(() => {
		setSearchTerm('');
		setStatusFilter('');
		setCategoryFilter('');
	}, []);

	const activeFilterCount = useMemo(() => {
		return [searchTerm, statusFilter, categoryFilter].filter(Boolean).length;
	}, [searchTerm, statusFilter, categoryFilter]);

	return {
		// State
		searchTerm,
		statusFilter,
		categoryFilter,
		activeFilterCount,

		// Setters
		setSearchTerm,
		setStatusFilter,
		setCategoryFilter,

		// Actions
		clearFilters,
	};
}
