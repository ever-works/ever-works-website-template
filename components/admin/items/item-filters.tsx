"use client";

import { useState, useRef, useEffect } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import * as Select from '@radix-ui/react-select';
import { Filter, X, ChevronDown, Check, Tag } from 'lucide-react';
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

// Style constants
const FILTER_CARD = 'mb-6 border-0 shadow-lg';
const FILTER_CARD_BODY = 'p-6';
const SELECT_TRIGGER = cn(
	'flex h-12 w-full items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm',
	'focus:outline-none focus:ring-2 focus:ring-theme-primary-500',
	'disabled:cursor-not-allowed disabled:opacity-50'
);
const SELECT_CONTENT = 'overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50';
const SELECT_ITEM = 'relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700';

/**
 * Item Filters Component
 * Provides filter controls for admin items with status, category, and tags
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

	// Status options with counts
	const statusOptions = [
		{ key: 'all', label: t('ALL_STATUSES') },
		{ key: 'draft', label: `${ITEM_STATUS_LABELS.draft} (${itemCounts.draft})` },
		{ key: 'pending', label: `${ITEM_STATUS_LABELS.pending} (${itemCounts.pending})` },
		{ key: 'approved', label: `${ITEM_STATUS_LABELS.approved} (${itemCounts.approved})` },
		{ key: 'rejected', label: `${ITEM_STATUS_LABELS.rejected} (${itemCounts.rejected})` },
	];

	// Category options
	const categoryOptions = [
		{ key: 'all', label: t('ALL_CATEGORIES') },
		...categories.map(cat => ({ key: cat.id, label: cat.name })),
	];

	return (
		<Card className={FILTER_CARD}>
			<CardBody className={FILTER_CARD_BODY}>
				<div className="flex flex-col gap-4">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Filter className="w-5 h-5 text-gray-400" />
							<span className="font-medium text-gray-900 dark:text-white">{t('FILTERS')}</span>
							{activeFilterCount > 0 && (
								<span className="px-2 py-0.5 text-xs font-medium bg-theme-primary text-white rounded-full">
									{activeFilterCount}
								</span>
							)}
						</div>
						{activeFilterCount > 0 && (
							<Button
								size="sm"
								variant="light"
								color="danger"
								onPress={onClearAll}
								startContent={<X className="w-4 h-4" />}
							>
								{t('CLEAR_ALL')}
							</Button>
						)}
					</div>

					{/* Filter Controls */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Status Filter */}
						<Select.Root
							value={statusFilter || 'all'}
							onValueChange={(value) => {
								onStatusChange(value === 'all' ? '' : value);
							}}
						>
							<Select.Trigger className={SELECT_TRIGGER}>
								<Select.Value placeholder={t('FILTER_BY_STATUS')} />
								<Select.Icon>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Select.Icon>
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
									className={SELECT_CONTENT}
									position="popper"
									sideOffset={4}
								>
									<Select.Viewport className="p-1">
										{statusOptions.map((status) => (
											<Select.Item
												key={status.key}
												value={status.key}
												className={SELECT_ITEM}
											>
												<Select.ItemIndicator className="absolute left-2 inline-flex items-center">
													<Check className="h-4 w-4" />
												</Select.ItemIndicator>
												<Select.ItemText>{status.label}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Viewport>
								</Select.Content>
							</Select.Portal>
						</Select.Root>

						{/* Category Filter */}
						<Select.Root
							value={categoryFilter || 'all'}
							onValueChange={(value) => {
								onCategoryChange(value === 'all' ? '' : value);
							}}
						>
							<Select.Trigger className={SELECT_TRIGGER}>
								<Select.Value placeholder={t('FILTER_BY_CATEGORY')} />
								<Select.Icon>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Select.Icon>
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
									className={SELECT_CONTENT}
									position="popper"
									sideOffset={4}
								>
									<Select.Viewport className="p-1 max-h-60 overflow-y-auto">
										{categoryOptions.map((category) => (
											<Select.Item
												key={category.key}
												value={category.key}
												className={SELECT_ITEM}
											>
												<Select.ItemIndicator className="absolute left-2 inline-flex items-center">
													<Check className="h-4 w-4" />
												</Select.ItemIndicator>
												<Select.ItemText>{category.label}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Viewport>
								</Select.Content>
							</Select.Portal>
						</Select.Root>

						{/* Tags Multi-Select */}
						<TagsMultiSelect
							selectedTags={tagsFilter}
							availableTags={tags}
							onTagsChange={onTagsChange}
							placeholder={t('SELECT_TAGS')}
						/>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}

// Tags Multi-Select Component
interface TagsMultiSelectProps {
	selectedTags: string[];
	availableTags: Array<{ id: string; name: string }>;
	onTagsChange: (tags: string[]) => void;
	placeholder: string;
}

function TagsMultiSelect({
	selectedTags,
	availableTags,
	onTagsChange,
	placeholder,
}: TagsMultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on click outside
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	const toggleTag = (tagId: string) => {
		if (selectedTags.includes(tagId)) {
			onTagsChange(selectedTags.filter(t => t !== tagId));
		} else {
			onTagsChange([...selectedTags, tagId]);
		}
	};

	const getDisplayText = () => {
		if (selectedTags.length === 0) return placeholder;
		if (selectedTags.length === 1) {
			const tag = availableTags.find(t => t.id === selectedTags[0]);
			return tag?.name || selectedTags[0];
		}
		return `${selectedTags.length} tags selected`;
	};

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={SELECT_TRIGGER}
			>
				<div className="flex items-center gap-2 flex-1 min-w-0">
					<Tag className="h-4 w-4 text-gray-400 shrink-0" />
					<span className="truncate text-gray-700 dark:text-gray-300">
						{getDisplayText()}
					</span>
				</div>
				<ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
			</button>

			{isOpen && (
				<div className={cn(SELECT_CONTENT, "absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto")}>
					<div className="p-1">
						{availableTags.length === 0 ? (
							<div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
								No tags available
							</div>
						) : (
							availableTags.map((tag) => {
								const isSelected = selectedTags.includes(tag.id);
								return (
									<button
										key={tag.id}
										type="button"
										onClick={() => toggleTag(tag.id)}
										className={cn(
											"w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
											"hover:bg-gray-100 dark:hover:bg-gray-700 text-left",
											isSelected && "bg-gray-50 dark:bg-gray-700/50"
										)}
									>
										<div className={cn(
											"w-4 h-4 rounded border flex items-center justify-center shrink-0",
											isSelected
												? "bg-theme-primary border-theme-primary"
												: "border-gray-300 dark:border-gray-600"
										)}>
											{isSelected && <Check className="h-3 w-3 text-white" />}
										</div>
										<span className="truncate">{tag.name}</span>
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
