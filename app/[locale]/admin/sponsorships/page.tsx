'use client';

import { useState, useCallback } from 'react';
import { useDebounceSearch } from '@/hooks/use-debounced-search';
import { useAdminSponsorAds } from '@/hooks/use-admin-sponsor-ads';
import { UniversalPagination } from '@/components/universal-pagination';
import { useTranslations } from 'next-intl';
import type { SponsorAd } from '@/lib/db/schema';
import type { SponsorAdStatus } from '@/lib/types/sponsor-ad';

// Components
import { PageHeader } from '@/components/admin/sponsorships/page-header';
import { SponsorStats } from '@/components/admin/sponsorships/sponsor-stats';
import { SponsorFilters } from '@/components/admin/sponsorships/sponsor-filters';
import { SponsorTable } from '@/components/admin/sponsorships/sponsor-table';
import { RejectModal } from '@/components/admin/sponsorships/reject-modal';
import { LoadingSkeleton } from '@/components/admin/sponsorships/loading-skeleton';

/**
 * Admin Sponsorships Page
 * Main orchestrator for the sponsorships management page
 */
export default function AdminSponsorshipsPage() {
	const t = useTranslations('admin.SPONSORSHIPS');

	// UI state
	const [searchTerm, setSearchTerm] = useState('');
	const [localStatusFilter, setLocalStatusFilter] = useState<SponsorAdStatus | undefined>(undefined);
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [selectedSponsorAd, setSelectedSponsorAd] = useState<SponsorAd | null>(null);
	const [rejectionReason, setRejectionReason] = useState('');
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	// Debounced search
	const { debouncedValue: debouncedSearchTerm, isSearching } = useDebounceSearch({
		searchValue: searchTerm,
		delay: 300,
		onSearch: () => {
			// Reset to page 1 when search changes
		},
	});

	// Data fetching hook
	const {
		sponsorAds,
		stats,
		isLoading,
		isSubmitting,
		currentPage,
		totalPages,
		totalItems,
		approveSponsorAd,
		rejectSponsorAd,
		cancelSponsorAd,
		deleteSponsorAd,
		setStatusFilter,
		setSearchTerm: setHookSearchTerm,
		setCurrentPage,
	} = useAdminSponsorAds();

	// Calculate active filters
	const activeFilterCount = [searchTerm, localStatusFilter].filter(Boolean).length;

	// Handlers
	const handleSearchChange = useCallback((value: string) => {
		setSearchTerm(value);
		setHookSearchTerm(value);
	}, [setHookSearchTerm]);

	const handleStatusChange = useCallback((value: SponsorAdStatus | undefined) => {
		setLocalStatusFilter(value);
		setStatusFilter(value);
	}, [setStatusFilter]);

	const handleClearFilters = useCallback(() => {
		setSearchTerm('');
		setLocalStatusFilter(undefined);
		setHookSearchTerm('');
		setStatusFilter(undefined);
		setCurrentPage(1);
	}, [setHookSearchTerm, setStatusFilter, setCurrentPage]);

	const handleApprove = useCallback(async (id: string) => {
		await approveSponsorAd(id);
	}, [approveSponsorAd]);

	const handleOpenRejectModal = useCallback((sponsorAd: SponsorAd) => {
		setSelectedSponsorAd(sponsorAd);
		setRejectionReason('');
		setRejectModalOpen(true);
	}, []);

	const handleCloseRejectModal = useCallback(() => {
		setRejectModalOpen(false);
		setSelectedSponsorAd(null);
		setRejectionReason('');
	}, []);

	const handleRejectConfirm = useCallback(async () => {
		if (!selectedSponsorAd || rejectionReason.length < 10) return;
		const success = await rejectSponsorAd(selectedSponsorAd.id, rejectionReason);
		if (success) {
			handleCloseRejectModal();
		}
	}, [selectedSponsorAd, rejectionReason, rejectSponsorAd, handleCloseRejectModal]);

	const handleCancel = useCallback(async (id: string) => {
		if (!confirm(t('CONFIRM_CANCEL'))) return;
		await cancelSponsorAd(id);
	}, [t, cancelSponsorAd]);

	const handleDelete = useCallback(async (id: string) => {
		if (confirmDeleteId !== id) {
			setConfirmDeleteId(id);
			return;
		}
		await deleteSponsorAd(id);
		setConfirmDeleteId(null);
	}, [confirmDeleteId, deleteSponsorAd]);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, [setCurrentPage]);

	// Loading state
	if (isLoading && sponsorAds.length === 0) {
		return <LoadingSkeleton />;
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			{/* Page Header */}
			<PageHeader />

			{/* Stats Cards */}
			<SponsorStats stats={stats} />

			{/* Filters */}
			<SponsorFilters
				searchTerm={searchTerm}
				statusFilter={localStatusFilter}
				onSearchChange={handleSearchChange}
				onStatusChange={handleStatusChange}
				onClearFilters={handleClearFilters}
				activeFilterCount={activeFilterCount}
				isSearching={isSearching}
			/>

			{/* Sponsor Ads Table */}
			<SponsorTable
				sponsorAds={sponsorAds}
				totalCount={totalItems}
				isLoading={isLoading}
				isSubmitting={isSubmitting}
				confirmDeleteId={confirmDeleteId}
				onApprove={handleApprove}
				onReject={handleOpenRejectModal}
				onCancel={handleCancel}
				onDelete={handleDelete}
			/>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex flex-col items-center mt-8 space-y-4">
					<UniversalPagination
						page={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</div>
			)}

			{/* Reject Modal */}
			<RejectModal
				isOpen={rejectModalOpen}
				sponsorAd={selectedSponsorAd}
				rejectionReason={rejectionReason}
				isSubmitting={isSubmitting}
				onReasonChange={setRejectionReason}
				onConfirm={handleRejectConfirm}
				onClose={handleCloseRejectModal}
			/>
		</div>
	);
}
