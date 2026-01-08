"use client";

import { useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Check, X, Circle } from 'lucide-react';
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

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
	draft: 'bg-gray-400',
	pending: 'bg-yellow-500',
	approved: 'bg-green-500',
	rejected: 'bg-red-500',
};

// Shared styles
const FILTER_BUTTON = cn(
	'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md',
	'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
	'transition-colors cursor-pointer border border-transparent',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
);

const FILTER_BUTTON_ACTIVE = cn(
	FILTER_BUTTON,
	'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
);

const POPOVER_CONTENT = cn(
	'min-w-[180px] bg-white dark:bg-gray-900 rounded-lg shadow-lg',
	'border border-gray-200 dark:border-gray-700 p-1 z-50',
	'animate-in fade-in-0 zoom-in-95'
);

const MENU_ITEM = cn(
	'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md cursor-pointer',
	'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
	'transition-colors outline-none'
);

/**
 * Modern Item Filters Component
 * Linear-style inline filter buttons with popovers
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

	// Get display label for status
	const getStatusLabel = () => {
		if (!statusFilter) return t('STATUS_LABEL');
		return ITEM_STATUS_LABELS[statusFilter as keyof typeof ITEM_STATUS_LABELS] || statusFilter;
	};

	// Get display label for category
	const getCategoryLabel = () => {
		if (!categoryFilter) return t('CATEGORY_LABEL');
		const cat = categories.find(c => c.id === categoryFilter);
		return cat?.name || categoryFilter;
	};

	// Get display label for tags
	const getTagsLabel = () => {
		if (tagsFilter.length === 0) return t('TAGS_LABEL');
		if (tagsFilter.length === 1) {
			const tag = tags.find(t => t.id === tagsFilter[0]);
			return tag?.name || tagsFilter[0];
		}
		return `${tagsFilter.length} tags`;
	};

	return (
		<div className="flex items-center gap-2 mb-4 flex-wrap">
			{/* Status Filter */}
			<Popover.Root>
				<Popover.Trigger asChild>
					<button className={statusFilter ? FILTER_BUTTON_ACTIVE : FILTER_BUTTON}>
						{statusFilter && (
							<Circle className={cn('w-2 h-2 fill-current', STATUS_COLORS[statusFilter]?.replace('bg-', 'text-'))} />
						)}
						<span>{getStatusLabel()}</span>
						<ChevronDown className="w-3.5 h-3.5 opacity-50" />
					</button>
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Content className={POPOVER_CONTENT} sideOffset={4} align="start">
						<StatusMenuItem
							label={t('ALL_STATUSES')}
							isSelected={!statusFilter}
							onClick={() => onStatusChange('')}
						/>
						<StatusMenuItem
							label={ITEM_STATUS_LABELS.draft}
							count={itemCounts.draft}
							status="draft"
							isSelected={statusFilter === 'draft'}
							onClick={() => onStatusChange('draft')}
						/>
						<StatusMenuItem
							label={ITEM_STATUS_LABELS.pending}
							count={itemCounts.pending}
							status="pending"
							isSelected={statusFilter === 'pending'}
							onClick={() => onStatusChange('pending')}
						/>
						<StatusMenuItem
							label={ITEM_STATUS_LABELS.approved}
							count={itemCounts.approved}
							status="approved"
							isSelected={statusFilter === 'approved'}
							onClick={() => onStatusChange('approved')}
						/>
						<StatusMenuItem
							label={ITEM_STATUS_LABELS.rejected}
							count={itemCounts.rejected}
							status="rejected"
							isSelected={statusFilter === 'rejected'}
							onClick={() => onStatusChange('rejected')}
						/>
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>

			{/* Category Filter */}
			<Popover.Root>
				<Popover.Trigger asChild>
					<button className={categoryFilter ? FILTER_BUTTON_ACTIVE : FILTER_BUTTON}>
						<span>{getCategoryLabel()}</span>
						<ChevronDown className="w-3.5 h-3.5 opacity-50" />
					</button>
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Content className={cn(POPOVER_CONTENT, 'max-h-64 overflow-y-auto')} sideOffset={4} align="start">
						<button
							className={MENU_ITEM}
							onClick={() => onCategoryChange('')}
						>
							{!categoryFilter && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
							<span className={!categoryFilter ? 'ml-0' : 'ml-5'}>{t('ALL_CATEGORIES')}</span>
						</button>
						{categories.map((category) => (
							<button
								key={category.id}
								className={MENU_ITEM}
								onClick={() => onCategoryChange(category.id)}
							>
								{categoryFilter === category.id && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
								<span className={categoryFilter === category.id ? 'ml-0' : 'ml-5'}>{category.name}</span>
							</button>
						))}
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>

			{/* Tags Filter */}
			<TagsFilter
				selectedTags={tagsFilter}
				availableTags={tags}
				onTagsChange={onTagsChange}
				label={getTagsLabel()}
				isActive={tagsFilter.length > 0}
			/>

			{/* Clear All */}
			{activeFilterCount > 0 && (
				<button
					onClick={onClearAll}
					className={cn(
						'inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md',
						'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
						'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
					)}
				>
					<X className="w-3.5 h-3.5" />
					<span>{t('CLEAR_ALL')}</span>
				</button>
			)}
		</div>
	);
}

// Status menu item with color dot
function StatusMenuItem({
	label,
	count,
	status,
	isSelected,
	onClick,
}: {
	label: string;
	count?: number;
	status?: string;
	isSelected: boolean;
	onClick: () => void;
}) {
	return (
		<button className={MENU_ITEM} onClick={onClick}>
			<div className="w-5 flex justify-center">
				{isSelected ? (
					<Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
				) : status ? (
					<Circle className={cn('w-2 h-2 fill-current', STATUS_COLORS[status]?.replace('bg-', 'text-'))} />
				) : null}
			</div>
			<span className="flex-1 text-left">{label}</span>
			{count !== undefined && (
				<span className="text-xs text-gray-400">{count}</span>
			)}
		</button>
	);
}

// Tags multi-select filter
function TagsFilter({
	selectedTags,
	availableTags,
	onTagsChange,
	label,
	isActive,
}: {
	selectedTags: string[];
	availableTags: Array<{ id: string; name: string }>;
	onTagsChange: (tags: string[]) => void;
	label: string;
	isActive: boolean;
}) {
	const toggleTag = (tagId: string) => {
		if (selectedTags.includes(tagId)) {
			onTagsChange(selectedTags.filter(t => t !== tagId));
		} else {
			onTagsChange([...selectedTags, tagId]);
		}
	};

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button className={isActive ? FILTER_BUTTON_ACTIVE : FILTER_BUTTON}>
					<span>{label}</span>
					<ChevronDown className="w-3.5 h-3.5 opacity-50" />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content className={cn(POPOVER_CONTENT, 'max-h-64 overflow-y-auto min-w-[200px]')} sideOffset={4} align="start">
					{availableTags.length === 0 ? (
						<div className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
							No tags available
						</div>
					) : (
						availableTags.map((tag) => {
							const isSelected = selectedTags.includes(tag.id);
							return (
								<button
									key={tag.id}
									className={MENU_ITEM}
									onClick={() => toggleTag(tag.id)}
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
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
