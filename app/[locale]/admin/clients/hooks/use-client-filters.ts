import { useState, useCallback, useEffect } from 'react';
import { computeDateRange } from '../utils/client-helpers';

export type DatePreset = 'all' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'custom';
export type DateFilterType = 'created' | 'updated';

export interface ClientFilters {
	searchTerm: string;
	statusFilter: string;
	planFilter: string;
	accountTypeFilter: string;
	providerFilter: string;
	datePreset: DatePreset;
	customDateFrom: string;
	customDateTo: string;
	dateFilterType: DateFilterType;
	createdAfter: string;
	createdBefore: string;
	updatedAfter: string;
	updatedBefore: string;
}

/**
 * Custom hook for managing client filter state
 * Implements Single Responsibility: Handles only filter state management
 */
export function useClientFilters() {
	// Filter state
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [planFilter, setPlanFilter] = useState<string>('');
	const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
	const [providerFilter, setProviderFilter] = useState<string>('');

	// Date filters
	const [datePreset, setDatePreset] = useState<DatePreset>('all');
	const [customDateFrom, setCustomDateFrom] = useState<string>('');
	const [customDateTo, setCustomDateTo] = useState<string>('');
	const [dateFilterType, setDateFilterType] = useState<DateFilterType>('created');

	// Computed date filters
	const [createdAfter, setCreatedAfter] = useState<string>('');
	const [createdBefore, setCreatedBefore] = useState<string>('');
	const [updatedAfter, setUpdatedAfter] = useState<string>('');
	const [updatedBefore, setUpdatedBefore] = useState<string>('');

	// Update computed date filters when date state changes
	useEffect(() => {
		const { from, to } = computeDateRange(datePreset, customDateFrom, customDateTo);

		if (dateFilterType === 'created') {
			setCreatedAfter(from);
			setCreatedBefore(to);
			setUpdatedAfter('');
			setUpdatedBefore('');
		} else {
			setUpdatedAfter(from);
			setUpdatedBefore(to);
			setCreatedAfter('');
			setCreatedBefore('');
		}
	}, [datePreset, dateFilterType, customDateFrom, customDateTo]);

	// Clear all filters
	const clearFilters = useCallback(() => {
		setSearchTerm('');
		setStatusFilter('');
		setPlanFilter('');
		setAccountTypeFilter('');
		setProviderFilter('');
		setDatePreset('all');
		setCustomDateFrom('');
		setCustomDateTo('');
		setDateFilterType('created');
	}, []);

	// Get all filter values
	const filters: ClientFilters = {
		searchTerm,
		statusFilter,
		planFilter,
		accountTypeFilter,
		providerFilter,
		datePreset,
		customDateFrom,
		customDateTo,
		dateFilterType,
		createdAfter,
		createdBefore,
		updatedAfter,
		updatedBefore,
	};

	return {
		// State
		filters,
		searchTerm,
		statusFilter,
		planFilter,
		accountTypeFilter,
		providerFilter,
		datePreset,
		customDateFrom,
		customDateTo,
		dateFilterType,
		createdAfter,
		createdBefore,
		updatedAfter,
		updatedBefore,

		// Setters
		setSearchTerm,
		setStatusFilter,
		setPlanFilter,
		setAccountTypeFilter,
		setProviderFilter,
		setDatePreset,
		setCustomDateFrom,
		setCustomDateTo,
		setDateFilterType,

		// Actions
		clearFilters,
	};
}
