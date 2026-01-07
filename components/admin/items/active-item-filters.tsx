"use client";

import { Button } from '@heroui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { ITEM_STATUS_LABELS } from '@/lib/types/item';

interface ActiveItemFiltersProps {
	statusFilter: string;
	categoryFilter: string;
	tagsFilter: string[];
	onRemoveStatus: () => void;
	onRemoveCategory: () => void;
	onRemoveTag: (tagId: string) => void;
	onClearAll: () => void;
	categories: Array<{ id: string; name: string }>;
	tags: Array<{ id: string; name: string }>;
}

// Style constants
const CHIP_BASE = cn(
	'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
	'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
	'border border-gray-200 dark:border-gray-700'
);
const CHIP_REMOVE_BUTTON = cn(
	'p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700',
	'transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary-500'
);

/**
 * Active Item Filters Component
 * Displays currently active filters as removable chips
 */
export function ActiveItemFilters({
	statusFilter,
	categoryFilter,
	tagsFilter,
	onRemoveStatus,
	onRemoveCategory,
	onRemoveTag,
	onClearAll,
	categories,
	tags,
}: ActiveItemFiltersProps) {
	const t = useTranslations('admin.ADMIN_ITEMS_PAGE');

	// Get category name by id
	const getCategoryName = (categoryId: string): string => {
		const category = categories.find(c => c.id === categoryId);
		return category?.name || categoryId;
	};

	// Get tag name by id
	const getTagName = (tagId: string): string => {
		const tag = tags.find(t => t.id === tagId);
		return tag?.name || tagId;
	};

	// Get status label
	const getStatusLabel = (status: string): string => {
		return ITEM_STATUS_LABELS[status as keyof typeof ITEM_STATUS_LABELS] || status;
	};

	const hasActiveFilters = statusFilter || categoryFilter || tagsFilter.length > 0;

	if (!hasActiveFilters) {
		return null;
	}

	return (
		<div className="mb-6 flex flex-wrap items-center gap-2">
			<span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
				{t('ACTIVE_FILTERS')}:
			</span>

			{/* Status Chip */}
			{statusFilter && (
				<span className={CHIP_BASE}>
					<span className="text-gray-500 dark:text-gray-400">{t('STATUS_LABEL')}:</span>
					<span>{getStatusLabel(statusFilter)}</span>
					<button
						type="button"
						onClick={onRemoveStatus}
						className={CHIP_REMOVE_BUTTON}
						aria-label={`Remove ${getStatusLabel(statusFilter)} filter`}
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</span>
			)}

			{/* Category Chip */}
			{categoryFilter && (
				<span className={CHIP_BASE}>
					<span className="text-gray-500 dark:text-gray-400">{t('CATEGORY_LABEL')}:</span>
					<span>{getCategoryName(categoryFilter)}</span>
					<button
						type="button"
						onClick={onRemoveCategory}
						className={CHIP_REMOVE_BUTTON}
						aria-label={`Remove ${getCategoryName(categoryFilter)} filter`}
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</span>
			)}

			{/* Tag Chips */}
			{tagsFilter.map((tagId) => (
				<span key={tagId} className={CHIP_BASE}>
					<span className="text-gray-500 dark:text-gray-400">{t('TAGS_LABEL')}:</span>
					<span>{getTagName(tagId)}</span>
					<button
						type="button"
						onClick={() => onRemoveTag(tagId)}
						className={CHIP_REMOVE_BUTTON}
						aria-label={`Remove ${getTagName(tagId)} filter`}
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</span>
			))}

			{/* Clear All Button */}
			<Button
				size="sm"
				variant="light"
				color="danger"
				onPress={onClearAll}
				className="ml-2"
			>
				{t('CLEAR_ALL')}
			</Button>
		</div>
	);
}
