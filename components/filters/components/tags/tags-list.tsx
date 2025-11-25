import { Link } from '@/i18n/navigation';
import { Tag } from '@/lib/content';
import { TagItem } from './tag-item';
import { getButtonVariantStyles } from '../../utils/style-utils';
import { expandVisibleTagsWithSelected, orderTagsWithSelectedFirst } from '../../utils/tag-utils';
import { formatDisplayName } from '../../utils/text-utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TagsListProps {
	tags: Tag[];
	basePath?: string;
	resetPath?: string;
	showAllTags: boolean;
	visibleTags: Tag[];
	isAnyTagActive: boolean;
	selectedTags?: string[];
	setSelectedTags?: (tags: string[]) => void;
	allItemsCount?: number;
}

/**
 * Tags list component
 * Renders a list of tag items with "All Tags" option
 */
export function TagsList({
	tags,
	basePath,
	resetPath,
	showAllTags,
	visibleTags,
	isAnyTagActive,
	selectedTags = [],
	setSelectedTags,
	allItemsCount
}: TagsListProps) {
	// 'All Tags' is active when no tags are selected
	const isAllTagsActive = setSelectedTags ? selectedTags.length === 0 : !isAnyTagActive;

	// Handle tag click for filter mode
	const handleTagClick = (tagId: string) => {
		if (!setSelectedTags) return;
		// If All Tags is active, selecting any tag should only select that tag
		if (selectedTags.length === 0) {
			setSelectedTags([tagId]);
			return;
		}
		if (selectedTags.includes(tagId)) {
			// Remove tag from selection
			const newTags = selectedTags.filter((id) => id !== tagId);
			setSelectedTags(newTags);
		} else {
			// Add tag to selection
			setSelectedTags([...selectedTags, tagId]);
		}
	};

	// In filter mode, ensure all selected tags are visible and order them properly
	let expandedVisibleTags = visibleTags;
	let orderedVisibleTags = expandedVisibleTags;

	if (setSelectedTags) {
		expandedVisibleTags = expandVisibleTagsWithSelected(visibleTags, tags, selectedTags);
		orderedVisibleTags = orderTagsWithSelectedFirst(expandedVisibleTags, selectedTags);
	}

	// Set the number of tags to show in collapsed mode
	const COLLAPSED_TAG_LIMIT = 5;

	// Render a single tag (button for filter, link for navigation)
	const renderTag = (tag: Tag, index: number) => {
		const tagBasePath = basePath ? `${basePath}/${tag.id}` : `/tags/${tag.id}`;

		const isActive = setSelectedTags ? selectedTags.includes(tag.id) : false;

		if (setSelectedTags) {
			// Filter mode (multi-select)
			return (
				<Button
					key={tag.id || index}
					variant={isActive ? 'solid' : 'bordered'}
					size="sm"
					className={getButtonVariantStyles(
						isActive,
						'px-1.5 py-1 h-8 font-medium transition-all duration-200 shrink-0 min-w-0 max-w-[140px] overflow-hidden whitespace-nowrap rounded-full'
					)}
					onClick={() => handleTagClick(tag.id)}
				>
					{isActive && (
						<svg
							className="w-3 h-3 mr-1.5 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
						</svg>
					)}
					{tag.icon_url && (
						<Image
							src={tag.icon_url}
							width={16}
							height={16}
							className={cn('w-4 h-4 mr-1.5 transition-transform', isActive ? 'brightness-200' : '')}
							alt={tag.name}
						/>
					)}
					<span
						className={cn(
							'text-sm font-medium transition-all duration-300 min-w-0 max-w-[90px] truncate overflow-hidden whitespace-nowrap',
							isActive
								? 'text-white tracking-wide'
								: 'text-gray-700 dark:text-gray-300 group-hover:text-theme-primary dark:group-hover:text-theme-primary'
						)}
					>
						{formatDisplayName(tag.name)}
					</span>
					{typeof tag.count === 'number' && (
						<span
							className={cn(
								'ml-1.5 text-xs font-normal',
								isActive ? 'text-white' : 'text-dark-500 dark:text-dark-400'
							)}
						>
							({tag.count})
						</span>
					)}
				</Button>
			);
		}

		// Navigation mode (single select, highlight if selected)
		return <TagItem key={tag.id || index} tag={tag} isActive={isActive} href={tagBasePath} showCount={true} />;
	};

	// Helper to wrap tag in min-width div for single-row view
	const renderTagWithMinWidth = (tag: Tag, idx: number) => (
		<div key={tag.id || idx} className="min-w-[120px] max-w-[140px] shrink-0">
			{renderTag(tag, idx)}
		</div>
	);

	return (
		<div className="relative">
			{!showAllTags && (
				<div className="w-full flex flex-nowrap gap-2 overflow-x-auto pb-2 hide-scrollbar scrollbar-thin scrollbar-thumb-theme-primary-10 dark:scrollbar-thumb-theme-primary-10 scrollbar-track-transparent min-w-0">
					{/* All Tags Button */}
					{setSelectedTags ? (
						<Button
							variant={isAllTagsActive ? 'solid' : 'bordered'}
							size="sm"
							className={getButtonVariantStyles(
								isAllTagsActive,
								'px-3 py-1 h-8 font-medium transition-all duration-300 shrink-0 group capitalize min-w-[90px] max-w-[140px] overflow-hidden rounded-full'
							)}
							onClick={() => setSelectedTags([])}
						>
							{isAllTagsActive && (
								<svg
									className="w-3 h-3 mr-1.5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="3"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
							<span className="truncate max-w-[90px] overflow-hidden whitespace-nowrap">All Tags</span>
							<span
								className={cn(
									'ml-1.5 text-xs font-normal',
									isAllTagsActive ? 'text-white' : 'text-dark-500 dark:text-dark-400'
								)}
							>
								({allItemsCount ?? tags.length})
							</span>
						</Button>
					) : (
						<Button
							variant={isAllTagsActive ? 'solid' : 'bordered'}
							size="sm"
							className={getButtonVariantStyles(
								isAllTagsActive,
								'px-3 py-1 h-8 font-medium transition-all duration-300 shrink-0 group capitalize min-w-[90px] max-w-[140px] overflow-hidden rounded-full'
							)}
							asChild
						>
							<Link href={resetPath || basePath || '/'}>
								{isAllTagsActive && (
									<svg
										className="w-3 h-3 mr-1.5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="3"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								)}
								<span className="truncate max-w-[90px] overflow-hidden whitespace-nowrap">
									All Tags
								</span>
								<span
									className={cn(
										'ml-1.5 text-xs font-normal',
										isAllTagsActive ? 'text-white' : 'text-dark-500 dark:text-dark-400'
									)}
								>
									({allItemsCount ?? tags.length})
								</span>
							</Link>
						</Button>
					)}
					{/* Hard limit: Only show up to COLLAPSED_TAG_LIMIT tags, prioritizing selected tags */}
					{(() => {
						// Always show selected tags first
						const selectedTagObjs = orderedVisibleTags.filter((tag) => selectedTags.includes(tag.id));
						const unselectedTagObjs = orderedVisibleTags.filter((tag) => !selectedTags.includes(tag.id));
						let tagsToShow: Tag[] = [];
						let hiddenCount = 0;
						if (selectedTagObjs.length > COLLAPSED_TAG_LIMIT) {
							// More selected tags than limit: show first N selected, +N more for the rest
							tagsToShow = selectedTagObjs.slice(0, COLLAPSED_TAG_LIMIT);
							hiddenCount = Math.max(0, selectedTagObjs.length - COLLAPSED_TAG_LIMIT);
						} else {
							// Show all selected, fill up to limit with unselected
							tagsToShow = [
								...selectedTagObjs,
								...unselectedTagObjs.slice(0, COLLAPSED_TAG_LIMIT - selectedTagObjs.length)
							];
							hiddenCount = 0; // No '+N more' if selected tags <= limit
						}
						return (
							<>
								{tagsToShow.map(renderTagWithMinWidth)}
								{hiddenCount > 0 && (
									<div className="min-w-[60px] max-w-[80px] shrink-0">
										<span className="inline-flex items-center justify-center px-2 py-1 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium select-none cursor-default">
											+{hiddenCount} more
										</span>
									</div>
								)}
							</>
						);
					})()}
				</div>
			)}

			{showAllTags && (
				<div className="w-full flex flex-wrap gap-2">
					{/* All Tags Button */}
					{setSelectedTags ? (
						<Button
							variant={isAllTagsActive ? 'solid' : 'bordered'}
							size="sm"
							className={getButtonVariantStyles(
								isAllTagsActive,
								'px-3 py-1 h-8 font-medium transition-all duration-200 rounded-full'
							)}
							onClick={() => setSelectedTags([])}
						>
							{isAllTagsActive && (
								<svg
									className="w-3 h-3 mr-1.5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="3"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
							<span>All Tags</span>
							<span
								className={cn(
									'ml-1.5 text-xs font-normal',
									isAllTagsActive ? 'text-white' : 'text-dark-500 dark:text-dark-400'
								)}
							>
								({allItemsCount ?? tags.length})
							</span>
						</Button>
					) : (
						<Button
							variant={isAllTagsActive ? 'solid' : 'bordered'}
							size="sm"
							className={getButtonVariantStyles(
								isAllTagsActive,
								'px-3 py-1 h-8 font-medium transition-all duration-200 rounded-full'
							)}
							asChild
						>
							<Link href={resetPath || basePath || '/'}>
								{isAllTagsActive && (
									<svg
										className="w-3 h-3 mr-1.5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="3"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								)}
								<span>All Tags</span>
								<span
									className={cn(
										'ml-1.5 text-xs font-normal',
										isAllTagsActive ? 'text-white' : 'text-dark-500 dark:text-dark-400'
									)}
								>
									({allItemsCount ?? tags.length})
								</span>
							</Link>
						</Button>
					)}
					{/* All Tags */}
					{orderedVisibleTags.map(renderTag)}
				</div>
			)}
		</div>
	);
}
