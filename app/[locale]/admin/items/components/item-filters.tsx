'use client';

import { Button, Chip, Modal, ModalContent, useDisclosure } from '@heroui/react';
import { Select, SelectItem } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { ItemStatusFilter } from '../hooks/use-item-filters';

interface ItemFiltersProps {
	// Filter values
	searchTerm: string;
	statusFilter: string;
	categoryFilter: string;

	// Filter setters
	onSearchChange: (value: string) => void;
	onStatusChange: (value: ItemStatusFilter) => void;
	onCategoryChange: (value: string) => void;
	onClearFilters: () => void;

	// UI state
	activeFilterCount: number;
	isSearching?: boolean;
}

const SEARCH_INPUT_CLASSES =
	'w-full pl-12 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400';

/**
 * Item Filters Component
 * Handles search and filter UI for admin items page
 * Following the pattern from client-filters.tsx
 */
export function ItemFilters(props: ItemFiltersProps) {
	const t = useTranslations('admin.ADMIN_ITEMS_PAGE');
	const { isOpen: isFilterModalOpen, onOpen: onOpenFilterModal, onClose: onCloseFilterModal } = useDisclosure();

	const handleClearSearch = () => {
		props.onSearchChange('');
	};

	return (
		<div className="mb-6">
			{/* Search Bar */}
			<div className="relative mb-4">
				<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
				<input
					type="text"
					placeholder={t('SEARCH_PLACEHOLDER')}
					value={props.searchTerm}
					onChange={(e) => props.onSearchChange(e.target.value)}
					aria-label={t('SEARCH_PLACEHOLDER')}
					className={SEARCH_INPUT_CLASSES}
				/>
				{/* Loading spinner or clear button */}
				{props.isSearching ? (
					<div className="absolute right-4 top-1/2 transform -translate-y-1/2">
						<LoadingSpinner size="sm" />
					</div>
				) : props.searchTerm ? (
					<button
						type="button"
						onClick={handleClearSearch}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label={t('CLEAR_SEARCH')}
					>
						<X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
					</button>
				) : null}
			</div>

			{/* Filter Button and Active Filters */}
			<div className="flex items-center justify-between mb-4">
				<Button
					size="sm"
					variant="flat"
					color="secondary"
					startContent={<Filter className="w-4 h-4" />}
					onPress={onOpenFilterModal}
				>
					{t('FILTERS')}
					{props.activeFilterCount > 0 && (
						<Chip size="sm" variant="flat" color="primary" className="ml-2">
							{props.activeFilterCount}
						</Chip>
					)}
				</Button>

				{props.activeFilterCount > 0 && (
					<Button size="sm" variant="light" color="danger" onPress={props.onClearFilters}>
						{t('CLEAR_ALL')}
					</Button>
				)}
			</div>

			{/* Active Filters Display */}
			{props.activeFilterCount > 0 && (
				<div className="flex flex-wrap gap-2 mb-4">
					{props.searchTerm && (
						<Chip variant="flat" color="primary" onClose={handleClearSearch}>
							{t('SEARCH_LABEL')} &ldquo;{props.searchTerm}&rdquo;
						</Chip>
					)}
					{props.statusFilter && (
						<Chip variant="flat" color="secondary" onClose={() => props.onStatusChange('')}>
							{t('STATUS_FILTER_LABEL')} {t(props.statusFilter.toUpperCase() as 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED')}
						</Chip>
					)}
					{props.categoryFilter && (
						<Chip variant="flat" color="warning" onClose={() => props.onCategoryChange('')}>
							{t('CATEGORY_FILTER_LABEL')} {props.categoryFilter}
						</Chip>
					)}
				</div>
			)}

			{/* Filter Modal */}
			<FilterModal
				isOpen={isFilterModalOpen}
				onClose={onCloseFilterModal}
				statusFilter={props.statusFilter}
				categoryFilter={props.categoryFilter}
				onStatusChange={props.onStatusChange}
				onCategoryChange={props.onCategoryChange}
				onClearFilters={props.onClearFilters}
			/>
		</div>
	);
}

interface FilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	statusFilter: string;
	categoryFilter: string;
	onStatusChange: (value: ItemStatusFilter) => void;
	onCategoryChange: (value: string) => void;
	onClearFilters: () => void;
}

function FilterModal(props: FilterModalProps) {
	const t = useTranslations('admin.ADMIN_ITEMS_PAGE');

	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose} size="lg">
			<ModalContent>
				<div className="relative overflow-visible">
					{/* Background Pattern */}
					<div className="absolute inset-0 bg-linear-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

					{/* Header */}
					<div className="relative z-10 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-linear-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-linear-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center shadow-lg">
								<Filter className="w-4 h-4 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('FILTER_ITEMS')}</h2>
								<p className="text-sm text-gray-600 dark:text-gray-400">{t('FILTER_SUBTITLE')}</p>
							</div>
						</div>
					</div>

					{/* Body */}
					<div className="relative z-10 px-6 py-6">
						<div className="space-y-6">
							{/* Status Filter */}
							<div className="space-y-2">
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('STATUS')}</span>
								<Select
									placeholder={t('ALL_STATUSES')}
									selectedKeys={props.statusFilter ? [props.statusFilter] : []}
									onSelectionChange={(keys) => props.onStatusChange((Array.from(keys)[0] as ItemStatusFilter) || '')}
									className="w-full"
									classNames={{
										trigger:
											'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary',
									}}
								>
									<SelectItem key="" value="">
										{t('ALL_STATUSES')}
									</SelectItem>
									<SelectItem key="draft" value="draft">
										{t('DRAFT')}
									</SelectItem>
									<SelectItem key="pending" value="pending">
										{t('PENDING')}
									</SelectItem>
									<SelectItem key="approved" value="approved">
										{t('APPROVED')}
									</SelectItem>
									<SelectItem key="rejected" value="rejected">
										{t('REJECTED')}
									</SelectItem>
								</Select>
							</div>

							{/* Category Filter (text input) */}
							<div className="space-y-2">
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('CATEGORY')}</span>
								<input
									type="text"
									placeholder={t('ALL_CATEGORIES')}
									value={props.categoryFilter}
									onChange={(e) => props.onCategoryChange(e.target.value)}
									className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
								/>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="relative z-10 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-linear-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
						<div className="flex items-center justify-between">
							<Button
								variant="flat"
								onPress={props.onClearFilters}
								className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
							>
								{t('CLEAR_ALL')}
							</Button>
							<div className="flex space-x-3">
								<Button
									variant="flat"
									onPress={props.onClose}
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
								>
									{t('CANCEL')}
								</Button>
								<Button
									color="primary"
									onPress={props.onClose}
									className="bg-linear-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40 transition-all duration-300 text-white font-medium"
								>
									{t('APPLY_FILTERS')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
