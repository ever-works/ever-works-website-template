'use client';
import { LayoutHome, useLayoutTheme } from '@/components/context';
import { Categories } from '@/components/filters/components/categories/categories-section';
import { Tags } from '@/components/filters/components/tags/tags-section';
import { Tag, Category, ItemData } from '@/lib/content';
import { sortByNumericProperty, filterItems } from '@/lib/utils';
import { HomeTwoLayout } from '@/components/home-two';
import { ListingClient } from '@/components/shared-card/listing-client';
import { useFilters } from '@/hooks/use-filters';
import { useMemo } from 'react';
import { sortItemsWithFeatured } from '@/lib/utils/featured-items';
import { useFeaturedItemsSection } from '@/hooks/use-feature-items-section';
import { TopLoadingBar } from '@/components/ui/top-loading-bar';

type ListingProps = {
	total: number;
	start: number;
	page: number;
	basePath: string;
	categories: Category[];
	tags: Tag[];
	items: ItemData[];
};

const LAYOUT_STYLES = {
	mobileOnly: 'lg:hidden z-10',
	desktopOnly: 'hidden lg:block z-10',
	tabletUp: 'hidden md:block',
	mobileDown: 'lg:hidden',
	largeUp: 'hidden xl:block',
	mainContainer: 'pb-8 sm:pb-10 md:pb-12 lg:pb-16 xl:pb-20',
	contentWrapper: 'flex flex-col lg:flex-row w-full gap-2 sm:gap-3 md:gap-4 lg:gap-4 xl:gap-5',
	sidebar: 'lg:sticky lg:top-4 lg:self-start',
	sidebarMobile: 'mb-3 sm:mb-4 md:mb-5 lg:mb-0',
	mainContent: 'w-full flex-1 min-w-0',
	pagination: 'flex items-center justify-center mt-6 sm:mt-8 md:mt-10 lg:mt-12',
	sectionGap: 'gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7',
	itemGap: 'gap-2 sm:gap-3 md:gap-4 lg:gap-5'
};

export default function GlobalsClient(props: ListingProps) {
	const { layoutHome = LayoutHome.HOME_ONE } = useLayoutTheme();
	const { selectedCategories, searchTerm, selectedTags, isFiltersLoading } =
		useFilters();
	const sortedTags = sortByNumericProperty(props.tags);
	const sortedCategories = sortByNumericProperty(props.categories);

	// Use the new hook for featured items
	const { featuredItems } = useFeaturedItemsSection({
		limit: 6,
		enabled: true
	});

	// Filtering logic using shared utility
	const filteredItems = useMemo(() => {
		const filtered = filterItems(props.items, {
			searchTerm,
			selectedTags,
			selectedCategories
		});

		// Sort items with featured items first
		return sortItemsWithFeatured(filtered, featuredItems);
	}, [props.items, searchTerm, selectedTags, selectedCategories, featuredItems]);

	// Note: URL parsing is handled by FilterURLParser in the Listing component
	// No need to duplicate that logic here
	// IMPORTANT: This file should NOT parse URL params - FilterURLParser handles that

	if (layoutHome === LayoutHome.HOME_ONE) {
		return (
			<>
				<TopLoadingBar isLoading={isFiltersLoading} />
				<div className={LAYOUT_STYLES.mainContainer}>
				{/* Featured Items Section - Only show on first page and desktop */}
				{/* {page === 1 && featuredItems.length > 0 && (
          <div className={`mb-8 sm:mb-10 md:mb-12 lg:mb-16 ${LAYOUT_STYLES.desktopOnly}`}>
            <FeaturedItemsSection
              className="mb-12"
              title="Featured Items"
              description="Discover our handpicked selection of top-rated tools and resources"
              limit={6}
              variant="hero"
            />
          </div>
        )} */}

				<div className={LAYOUT_STYLES.contentWrapper}>
					{/* Sidebar - Categories */}
					<div className={`${LAYOUT_STYLES.sidebar} ${LAYOUT_STYLES.sidebarMobile}`}>
						<Categories total={props.total} categories={sortedCategories} tags={sortedTags} />
					</div>

					{/* Main Content */}
					<div className={LAYOUT_STYLES.mainContent}>
						{/* Tags Section - Mobile version */}
						<div className={` lg:sticky lg:top-4 mb-4 sm:mb-6 md:mb-8 ${LAYOUT_STYLES.mobileOnly}`}>
							<Tags tags={sortedTags} enableSticky={false} maxVisibleTags={3} allItems={props.items} />
						</div>
						{/* Tags Section - Desktop version */}
						<div className={`lg:sticky lg:top-4 mb-4 sm:mb-6 md:mb-8 ${LAYOUT_STYLES.desktopOnly}`}>
							<Tags tags={sortedTags} enableSticky={true} maxVisibleTags={5} allItems={props.items} />
						</div>

						{/* Listing Content */}
						<div className="mb-6 sm:mb-8 md:mb-10">
							<ListingClient
								{...props}
								items={filteredItems}
								totalCount={props.items.length}
								config={{
									showStats: false,
									showViewToggle: true,
									showFilters: false,
									showPagination: true,
									showEmptyState: true,
									enableSearch: false,
									enableTagFilter: false,
									enableSorting: true,
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			</>
		);
	}

	return (
		<>
			<TopLoadingBar isLoading={isFiltersLoading} />
			<div className={LAYOUT_STYLES.mainContainer}>
				<HomeTwoLayout
					{...props}
					categories={sortedCategories}
					tags={sortedTags}
					filteredAndSortedItems={filteredItems}
				/>
			</div>
		</>
	);
}
