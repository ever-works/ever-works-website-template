'use client';

import { useCallback, useMemo } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiDollarSign, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
	SponsorshipStatsCards,
	SponsorshipFilters,
	SponsorshipList,
	type SponsorshipStatusFilter,
} from '@/components/sponsorships';
import { useUserSponsorAds } from '@/hooks/use-user-sponsor-ads';
import { Button } from '@/components/ui/button';
import type { SponsorAdStatus } from '@/lib/types/sponsor-ad';

export function SponsorshipsContent() {
	const t = useTranslations('client.sponsorships');

	// Data fetching - hook manages all filter state internally
	const {
		sponsorAds,
		stats,
		totalPages,
		currentPage,
		isLoading,
		isFetching,
		isStatsLoading,
		isSearching,
		statusFilter,
		search,
		setStatusFilter,
		setSearch,
		setCurrentPage,
		nextPage,
		prevPage,
	} = useUserSponsorAds();

	// Convert hook status filter to tab value for UI
	const statusTab: SponsorshipStatusFilter = statusFilter || 'all';

	// Handle tab change - update hook state and reset page
	const handleStatusChange = useCallback((newStatus: SponsorshipStatusFilter) => {
		const hookStatus: SponsorAdStatus | undefined = newStatus === 'all' ? undefined : newStatus;
		setStatusFilter(hookStatus);
		setCurrentPage(1);
	}, [setStatusFilter, setCurrentPage]);

	// Handle search change - update hook state and reset page
	const handleSearchChange = useCallback((newSearch: string) => {
		setSearch(newSearch);
		if (newSearch !== search) {
			setCurrentPage(1);
		}
	}, [setSearch, search, setCurrentPage]);

	// Status counts for filter tabs
	const statusCounts = useMemo(() => ({
		all: stats.overview.total,
		active: stats.overview.active,
		pending: stats.overview.pendingPayment + stats.overview.pending,
		expired: stats.overview.expired,
		cancelled: stats.overview.cancelled,
	}), [stats]);

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
			<Container maxWidth="7xl" padding="default">
				<div className="space-y-8 py-8">
					{/* Page Header */}
					<div className="text-center space-y-4">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-2xl mb-4">
							<FiDollarSign className="w-8 h-8 text-theme-primary-600 dark:text-theme-primary-400" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
							{t('PAGE_TITLE')}
						</h1>
						<p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
							{t('PAGE_DESCRIPTION')}
						</p>
					</div>

					{/* Stats Cards */}
					<SponsorshipStatsCards stats={stats} isLoading={isStatsLoading} />

					{/* Sponsorships List */}
					<Card className="hover:shadow-lg hover:shadow-theme-primary-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs">
						<CardHeader>
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
									<FiDollarSign className="w-5 h-5 text-theme-primary-600 dark:text-theme-primary-400" />
									{t('YOUR_SPONSORSHIPS')}
								</CardTitle>
								<div className="flex items-center gap-3">
									<Link
										href="/sponsor"
										className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 text-white rounded-lg transition-all duration-300 font-medium shadow-xs hover:shadow-md"
									>
										<FiPlus className="w-4 h-4" />
										{t('NEW_SPONSORSHIP')}
									</Link>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Filters */}
							<SponsorshipFilters
								status={statusTab}
								search={search}
								onStatusChange={handleStatusChange}
								onSearchChange={handleSearchChange}
								isSearching={isSearching}
								disabled={isLoading}
								statusCounts={statusCounts}
							/>

							{/* List */}
							<SponsorshipList
								items={sponsorAds}
								isLoading={isLoading}
								emptyStateTitle={t('EMPTY_STATE_TITLE')}
								emptyStateDescription={t('EMPTY_STATE_DESC')}
							/>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{t('SHOWING_PAGE', { page: currentPage, totalPages })}
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={prevPage}
											disabled={currentPage === 1 || isFetching}
										>
											<FiChevronLeft className="w-4 h-4" />
											{t('PREVIOUS')}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={nextPage}
											disabled={currentPage >= totalPages || isFetching}
										>
											{t('NEXT')}
											<FiChevronRight className="w-4 h-4" />
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</Container>
		</div>
	);
}
