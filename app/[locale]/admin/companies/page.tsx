'use client';

import { useState, useCallback } from 'react';
import { useDebounceSearch } from '@/hooks/use-debounced-search';
import { useAdminCompanies, type Company } from '@/hooks/use-admin-companies';
import { UniversalPagination } from '@/components/universal-pagination';
import type { CreateCompanyInput } from '@/lib/validations/company';

// Components
import { PageHeader } from './components/page-header';
import { CompanyStats } from './components/company-stats';
import { CompanyFilters } from './components/company-filters';
import { CompaniesTable } from './components/companies-table';
import { LoadingSkeleton } from './components/loading-skeleton';
import { CompanyModal } from './components/company-modal';

/**
 * Companies Page Component
 * Main orchestrator for the companies management page
 */
export default function CompaniesPage() {
	// UI state
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Debounced search
	const { debouncedValue: debouncedSearchTerm, isSearching } = useDebounceSearch({
		searchValue: searchTerm,
		delay: 300,
		onSearch: () => {
			if (currentPage !== 1) {
				setCurrentPage(1);
			}
		},
	});

	// Data fetching hook
	const { companies, stats, total, page, totalPages, isLoading, isSubmitting, createCompany, deleteCompany } =
		useAdminCompanies({
			params: {
				page: currentPage,
				limit,
				search: debouncedSearchTerm,
				status: statusFilter as 'active' | 'inactive' | undefined,
				sortBy: 'createdAt',
				sortOrder: 'desc',
			},
		});

	// Calculate active filters
	const activeFilterCount = [searchTerm, statusFilter].filter(Boolean).length;
	const hasActiveFilters = activeFilterCount > 0;

	// Handlers
	const handleAddCompany = useCallback(() => {
		setIsCreateModalOpen(true);
	}, []);

	const handleCreateCompany = useCallback(
		async (data: CreateCompanyInput) => {
			const success = await createCompany(data);
			if (success) {
				setIsCreateModalOpen(false);
				// Reset to page 1 to see the new company
				setCurrentPage(1);
			}
		},
		[createCompany]
	);

	const handleCloseModal = useCallback(() => {
		setIsCreateModalOpen(false);
	}, []);

	const handleEditCompany = useCallback((company: Company) => {
		// TODO: Implement edit company modal
		console.log('Edit company:', company);
	}, []);

	const handleDeleteCompany = useCallback(
		async (companyId: string) => {
			setCompanyToDelete(companyId);
			const success = await deleteCompany(companyId);
			if (success) {
				setCompanyToDelete(null);
			}
		},
		[deleteCompany]
	);

	const handleClearFilters = useCallback(() => {
		setSearchTerm('');
		setStatusFilter('');
		setCurrentPage(1);
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	// Loading state
	if (isLoading && companies.length === 0) {
		return <LoadingSkeleton />;
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			{/* Page Header */}
			<PageHeader onAddCompany={handleAddCompany} />

			{/* Stats Cards */}
			<CompanyStats stats={stats} />

			{/* Filters */}
			<CompanyFilters
				searchTerm={searchTerm}
				statusFilter={statusFilter}
				onSearchChange={setSearchTerm}
				onStatusChange={setStatusFilter}
				onClearFilters={handleClearFilters}
				activeFilterCount={activeFilterCount}
				isSearching={isSearching}
			/>

			{/* Companies Table */}
			<CompaniesTable
				companies={companies}
				totalCount={total}
				isLoading={isLoading}
				deletingCompanyId={companyToDelete}
				onEdit={handleEditCompany}
				onDelete={handleDeleteCompany}
				onCreateFirst={handleAddCompany}
				hasActiveFilters={hasActiveFilters}
			/>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex flex-col items-center mt-8 space-y-4">
					<UniversalPagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
				</div>
			)}

			{/* Create Company Modal */}
			<CompanyModal
				isOpen={isCreateModalOpen}
				isSubmitting={isSubmitting}
				onSubmit={handleCreateCompany}
				onClose={handleCloseModal}
			/>
		</div>
	);
}
