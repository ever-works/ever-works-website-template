'use client';

import { useTranslations } from 'next-intl';
import { FiSearch, FiX, FiLoader, FiChevronDown } from 'react-icons/fi';
import type { SponsorAdStatus } from '@/lib/types/sponsor-ad';

// Filter options for sponsorship status
export type SponsorshipStatusFilter = SponsorAdStatus | 'all';
export type SponsorshipIntervalFilter = 'weekly' | 'monthly' | 'all';

export const SPONSORSHIP_STATUS_FILTERS: { value: SponsorshipStatusFilter; labelKey: string }[] = [
	{ value: 'all', labelKey: 'ALL' },
	{ value: 'active', labelKey: 'ACTIVE' },
	{ value: 'pending', labelKey: 'PENDING' },
	{ value: 'pending_payment', labelKey: 'PENDING_PAYMENT' },
	{ value: 'expired', labelKey: 'EXPIRED' },
	{ value: 'rejected', labelKey: 'REJECTED' },
	{ value: 'cancelled', labelKey: 'CANCELLED' },
];

export const SPONSORSHIP_INTERVAL_FILTERS: { value: SponsorshipIntervalFilter; labelKey: string }[] = [
	{ value: 'all', labelKey: 'ALL' },
	{ value: 'weekly', labelKey: 'WEEKLY' },
	{ value: 'monthly', labelKey: 'MONTHLY' },
];

export interface SponsorshipFiltersProps {
	status: SponsorshipStatusFilter;
	interval: SponsorshipIntervalFilter;
	search: string;
	onStatusChange: (status: SponsorshipStatusFilter) => void;
	onIntervalChange: (interval: SponsorshipIntervalFilter) => void;
	onSearchChange: (search: string) => void;
	isSearching?: boolean;
	disabled?: boolean;
}

export function SponsorshipFilters({
	status,
	interval,
	search,
	onStatusChange,
	onIntervalChange,
	onSearchChange,
	isSearching = false,
	disabled = false,
}: SponsorshipFiltersProps) {
	const t = useTranslations('client.sponsorships');

	const handleClearSearch = () => {
		onSearchChange('');
	};

	return (
		<div className="flex flex-col sm:flex-row gap-3">
			{/* Status Filter */}
			<div className="relative">
				<select
					value={status}
					onChange={(e) => onStatusChange(e.target.value as SponsorshipStatusFilter)}
					disabled={disabled}
					className={`
						appearance-none w-full sm:w-40 pl-3 pr-9 py-2.5
						bg-white dark:bg-gray-800
						border border-gray-200 dark:border-gray-700
						rounded-lg
						text-sm text-gray-900 dark:text-gray-100
						focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent
						transition-all duration-200
						${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
					`}
				>
					{SPONSORSHIP_STATUS_FILTERS.map((filter) => (
						<option key={filter.value} value={filter.value}>
							{t(`STATUS_${filter.labelKey}`)}
						</option>
					))}
				</select>
				<FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
			</div>

			{/* Interval Filter */}
			<div className="relative">
				<select
					value={interval}
					onChange={(e) => onIntervalChange(e.target.value as SponsorshipIntervalFilter)}
					disabled={disabled}
					className={`
						appearance-none w-full sm:w-36 pl-3 pr-9 py-2.5
						bg-white dark:bg-gray-800
						border border-gray-200 dark:border-gray-700
						rounded-lg
						text-sm text-gray-900 dark:text-gray-100
						focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent
						transition-all duration-200
						${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
					`}
				>
					{SPONSORSHIP_INTERVAL_FILTERS.map((filter) => (
						<option key={filter.value} value={filter.value}>
							{t(`INTERVAL_${filter.labelKey}`)}
						</option>
					))}
				</select>
				<FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
			</div>

			{/* Search Input */}
			<div className="relative flex-1">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					{isSearching ? (
						<FiLoader className="w-4 h-4 text-gray-400 animate-spin" />
					) : (
						<FiSearch className="w-4 h-4 text-gray-400" />
					)}
				</div>
				<input
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder={t('SEARCH_PLACEHOLDER')}
					disabled={disabled}
					className={`
						w-full pl-9 pr-9 py-2.5
						bg-white dark:bg-gray-800
						border border-gray-200 dark:border-gray-700
						rounded-lg
						text-sm text-gray-900 dark:text-gray-100
						placeholder-gray-500 dark:placeholder-gray-400
						focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent
						transition-all duration-200
						${disabled ? 'opacity-50 cursor-not-allowed' : ''}
					`}
				/>
				{search && !disabled && (
					<button
						onClick={handleClearSearch}
						className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
					>
						<FiX className="w-4 h-4" />
					</button>
				)}
			</div>
		</div>
	);
}
