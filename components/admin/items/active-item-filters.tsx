"use client";

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
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

// Minimal chip style
const CHIP = cn(
	'inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs font-medium rounded-full',
	'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
	'border border-gray-200 dark:border-gray-700'
);

const CHIP_REMOVE = cn(
	'p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700',
	'transition-colors focus:outline-none'
);

/**
 * Active Item Filters Component
 * Displays currently active filters as minimal removable chips
 */
export function ActiveItemFilters({
	statusFilter,
	categoryFilter,
	tagsFilter,
	onRemoveStatus,
	onRemoveCategory,
	onRemoveTag,
	categories,
	tags,
}: ActiveItemFiltersProps) {
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
		<div className="flex items-center gap-1.5 mb-4 flex-wrap">
			{/* Status Chip */}
			{statusFilter && (
				<span className={CHIP}>
					<span>{getStatusLabel(statusFilter)}</span>
					<button
						type="button"
						onClick={onRemoveStatus}
						className={CHIP_REMOVE}
						aria-label={`Remove ${getStatusLabel(statusFilter)} filter`}
					>
						<X className="h-3 w-3" />
					</button>
				</span>
			)}

			{/* Category Chip */}
			{categoryFilter && (
				<span className={CHIP}>
					<span>{getCategoryName(categoryFilter)}</span>
					<button
						type="button"
						onClick={onRemoveCategory}
						className={CHIP_REMOVE}
						aria-label={`Remove ${getCategoryName(categoryFilter)} filter`}
					>
						<X className="h-3 w-3" />
					</button>
				</span>
			)}

			{/* Tag Chips */}
			{tagsFilter.map((tagId) => (
				<span key={tagId} className={CHIP}>
					<span>{getTagName(tagId)}</span>
					<button
						type="button"
						onClick={() => onRemoveTag(tagId)}
						className={CHIP_REMOVE}
						aria-label={`Remove ${getTagName(tagId)} filter`}
					>
						<X className="h-3 w-3" />
					</button>
				</span>
			))}
		</div>
	);
}
