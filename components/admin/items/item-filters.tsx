"use client";

import * as Popover from '@radix-ui/react-popover';
import { Filter, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { ITEM_STATUS_LABELS } from '@/lib/types/item';

interface ItemFiltersProps {
	statusFilter: string;
	categoryFilter: string;
	tagsFilter: string[];
	onStatusChange: (status: string) => void;
	onCategoryChange: (category: string) => void;
	onTagsChange: (tags: string[]) => void;
	onClearAll: () => void;
	categories: Array<{ id: string; name: string }>;
	tags: Array<{ id: string; name: string }>;
	itemCounts: {
		draft: number;
		pending: number;
		approved: number;
		rejected: number;
	};
	activeFilterCount: number;
}

// Status tab style - compact for table header
const STATUS_TAB = cn(
	'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer',
	'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
);

const STATUS_TAB_ACTIVE = cn(
	'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer',
	'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
);

/**
 * Substack-style Item Filters Component
 * - Horizontal status tabs with counts
 * - Filter button for category/tags
 */
export function ItemFilters({
	statusFilter,
	categoryFilter,
	tagsFilter,
	onStatusChange,
	onCategoryChange,
	onTagsChange,
	onClearAll,
	categories,
	tags,
	itemCounts,
	activeFilterCount,
}: ItemFiltersProps) {
	const t = useTranslations('admin.ADMIN_ITEMS_PAGE');

	const totalCount = itemCounts.draft + itemCounts.pending + itemCounts.approved + itemCounts.rejected;
	const hasAdvancedFilters = categoryFilter || tagsFilter.length > 0;
	const advancedFilterCount = (categoryFilter ? 1 : 0) + tagsFilter.length;

	// Toggle tag selection
	const toggleTag = (tagId: string) => {
		if (tagsFilter.includes(tagId)) {
			onTagsChange(tagsFilter.filter(t => t !== tagId));
		} else {
			onTagsChange([...tagsFilter, tagId]);
		}
	};

	// Clear advanced filters only (category + tags)
	const clearAdvancedFilters = () => {
		onCategoryChange('');
		onTagsChange([]);
	};

	return (
		<div className="flex items-center gap-3">
			{/* Status Tabs */}
			<div className="flex items-center gap-0.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-0.5">
				<button
					onClick={() => onStatusChange('')}
					className={!statusFilter ? STATUS_TAB_ACTIVE : STATUS_TAB}
				>
					All
					<span className="ml-1.5 text-xs text-gray-400">{totalCount}</span>
				</button>
				<button
					onClick={() => onStatusChange('approved')}
					className={statusFilter === 'approved' ? STATUS_TAB_ACTIVE : STATUS_TAB}
				>
					{ITEM_STATUS_LABELS.approved}
					<span className="ml-1.5 text-xs text-gray-400">{itemCounts.approved}</span>
				</button>
				<button
					onClick={() => onStatusChange('pending')}
					className={statusFilter === 'pending' ? STATUS_TAB_ACTIVE : STATUS_TAB}
				>
					{ITEM_STATUS_LABELS.pending}
					<span className="ml-1.5 text-xs text-gray-400">{itemCounts.pending}</span>
				</button>
				<button
					onClick={() => onStatusChange('draft')}
					className={statusFilter === 'draft' ? STATUS_TAB_ACTIVE : STATUS_TAB}
				>
					{ITEM_STATUS_LABELS.draft}
					<span className="ml-1.5 text-xs text-gray-400">{itemCounts.draft}</span>
				</button>
				<button
					onClick={() => onStatusChange('rejected')}
					className={statusFilter === 'rejected' ? STATUS_TAB_ACTIVE : STATUS_TAB}
				>
					{ITEM_STATUS_LABELS.rejected}
					<span className="ml-1.5 text-xs text-gray-400">{itemCounts.rejected}</span>
				</button>
			</div>

			{/* Filter Button (for category & tags) */}
			<Popover.Root>
				<Popover.Trigger asChild>
					<button className={cn(
						'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md',
						'border border-gray-200 dark:border-gray-700',
						'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
						'transition-colors cursor-pointer',
						hasAdvancedFilters && 'bg-gray-50 dark:bg-gray-800'
					)}>
						<Filter className="w-3.5 h-3.5" />
						<span>{t('FILTERS')}</span>
						{advancedFilterCount > 0 && (
							<span className="flex items-center justify-center w-4 h-4 text-[10px] font-semibold rounded-full bg-theme-primary text-white">
								{advancedFilterCount}
							</span>
						)}
					</button>
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Content
						className={cn(
							'w-72 bg-white dark:bg-gray-900 rounded-lg shadow-lg',
							'border border-gray-200 dark:border-gray-700 p-4 z-50',
							'animate-in fade-in-0 zoom-in-95'
						)}
						sideOffset={8}
						align="end"
					>
						{/* Category Section */}
						<div className="mb-4">
							<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
								{t('CATEGORY_LABEL')}
							</label>
							<div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
								<button
									onClick={() => onCategoryChange('')}
									className={cn(
										'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md',
										'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
										!categoryFilter ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
									)}
								>
									{!categoryFilter && <Check className="w-4 h-4" />}
									<span className={!categoryFilter ? '' : 'ml-6'}>{t('ALL_CATEGORIES')}</span>
								</button>
								{categories.map((category) => (
									<button
										key={category.id}
										onClick={() => onCategoryChange(category.id)}
										className={cn(
											'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md',
											'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
											categoryFilter === category.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
										)}
									>
										{categoryFilter === category.id && <Check className="w-4 h-4" />}
										<span className={categoryFilter === category.id ? '' : 'ml-6'}>{category.name}</span>
									</button>
								))}
							</div>
						</div>

						{/* Tags Section */}
						<div className="mb-4">
							<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
								{t('TAGS_LABEL')}
							</label>
							<div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
								{tags.length === 0 ? (
									<p className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1">
										No tags available
									</p>
								) : (
									tags.map((tag) => {
										const isSelected = tagsFilter.includes(tag.id);
										return (
											<button
												key={tag.id}
												onClick={() => toggleTag(tag.id)}
												className={cn(
													'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md',
													'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
													isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
												)}
											>
												<div className={cn(
													'w-4 h-4 rounded border flex items-center justify-center shrink-0',
													isSelected
														? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white'
														: 'border-gray-300 dark:border-gray-600'
												)}>
													{isSelected && <Check className="w-3 h-3 text-white dark:text-gray-900" />}
												</div>
												<span>{tag.name}</span>
											</button>
										);
									})
								)}
							</div>
						</div>

						{/* Clear Filters */}
						{hasAdvancedFilters && (
							<button
								onClick={clearAdvancedFilters}
								className={cn(
									'flex items-center gap-1.5 w-full px-2 py-1.5 text-sm rounded-md',
									'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
									'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
								)}
							>
								<X className="w-4 h-4" />
								<span>{t('CLEAR_ALL')}</span>
							</button>
						)}
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>
		</div>
	);
}
