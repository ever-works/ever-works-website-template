'use client';

import { useState, useCallback } from 'react';
import { useDebounceSearch } from '@/hooks/use-debounced-search';
import { useAdminCompanies } from '@/hooks/use-admin-companies';
import { UniversalPagination } from '@/components/universal-pagination';
import type { Company } from '@/types/company';
import type { CreateCompanyInput, UpdateCompanyInput } from '@/lib/validations/company';

// Components
import { PageHeader } from '@/components/admin/companies/page-header';
import { CompanyStats } from '@/components/admin/companies/company-stats';
import { CompanyFilters } from '@/components/admin/companies/company-filters';
import { CompaniesTable } from '@/components/admin/companies/companies-table';
import { LoadingSkeleton } from '@/components/admin/companies/loading-skeleton';
import { CompanyModal, DeleteConfirmationModal } from '@/components/admin/companies/company-modal';

/**
 * Companies Page Component
 * Main orchestrator for the companies management page
 */
export default function CompaniesPage() {
	// UI state
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');
	const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

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
	const {
		companies,
		stats,
		total,
		page,
		totalPages,
		isLoading,
		isSubmitting,
		createCompany,
		updateCompany,
		deleteCompany,
	} = useAdminCompanies({
		params: {
			page: currentPage,
			limit,
			search: debouncedSearchTerm,
			status: statusFilter || undefined,
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
		async (data: CreateCompanyInput | UpdateCompanyInput) => {
			const success = await createCompany(data as CreateCompanyInput);
			if (success) {
				setIsCreateModalOpen(false);
				// Reset to page 1 to see the new company
				setCurrentPage(1);
			}
		},
		[createCompany]
	);

	const handleCloseCreateModal = useCallback(() => {
		setIsCreateModalOpen(false);
	}, []);

	const handleEditCompany = useCallback((company: Company) => {
		setSelectedCompany(company);
		setIsEditModalOpen(true);
	}, []);

	const handleUpdateCompany = useCallback(
		async (data: CreateCompanyInput | UpdateCompanyInput) => {
			const updateData = data as UpdateCompanyInput;
			const success = await updateCompany(updateData.id, updateData);
			if (success) {
				setIsEditModalOpen(false);
				setSelectedCompany(null);
			}
		},
		[updateCompany]
	);

	const handleCloseEditModal = useCallback(() => {
		setIsEditModalOpen(false);
		setSelectedCompany(null);
	}, []);

	const handleDeleteClick = useCallback(
		(companyId: string) => {
			const company = companies.find((c) => c.id === companyId);
			if (company) {
				setCompanyToDelete(company);
				setIsDeleteModalOpen(true);
			}
		},
		[companies]
	);

	const handleConfirmDelete = useCallback(async () => {
		if (!companyToDelete) return;
		const success = await deleteCompany(companyToDelete.id);
		if (success) {
			setIsDeleteModalOpen(false);
			setCompanyToDelete(null);
		}
	}, [companyToDelete, deleteCompany]);

	const handleCancelDelete = useCallback(() => {
		setIsDeleteModalOpen(false);
		setCompanyToDelete(null);
	}, []);

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
				deletingCompanyId={companyToDelete?.id || null}
				onEdit={handleEditCompany}
				onDelete={handleDeleteClick}
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
				mode="create"
				isSubmitting={isSubmitting}
				onSubmit={handleCreateCompany}
				onClose={handleCloseCreateModal}
			/>

			{/* Edit Company Modal */}
			<CompanyModal
				isOpen={isEditModalOpen}
				mode="edit"
				company={selectedCompany}
				isSubmitting={isSubmitting}
				onSubmit={handleUpdateCompany}
				onClose={handleCloseEditModal}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				companyName={companyToDelete?.name}
				isDeleting={isSubmitting}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
		</div>
	);
}
