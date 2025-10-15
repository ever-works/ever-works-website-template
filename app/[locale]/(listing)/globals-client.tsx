'use client';
import { LayoutHome, useLayoutTheme } from '@/components/context';
import { Categories } from '@/components/filters/components/categories/categories-section';
import { Paginate } from '@/components/filters/components/pagination/paginate';
import { Tags } from '@/components/filters/components/tags/tags-section';
import { Tag, Category, ItemData } from '@/lib/content';
import { sortByNumericProperty, filterItems } from '@/lib/utils';
import { HomeTwoLayout } from '@/components/home-two';
import { ListingClient } from '@/components/shared-card/listing-client';
import { useFilters } from '@/hooks/use-filters';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PER_PAGE, totalPages } from '@/lib/paginate';
import { sortItemsWithFeatured } from '@/lib/utils/featured-items';
import { useFeaturedItemsSection } from '@/hooks/use-feature-items-section';

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
	const { layoutHome = LayoutHome.HOME_ONE, paginationType } = useLayoutTheme();
	const { selectedCategories, searchTerm, selectedTags, sortBy, setSelectedTags, setSelectedCategories } =
		useFilters();
	const sortedTags = sortByNumericProperty(props.tags);
	const sortedCategories = sortByNumericProperty(props.categories);
	const searchParams = useSearchParams();
	const [isMounted, setIsMounted] = useState(false);

	// Use the new hook for featured items
	const { featuredItems } = useFeaturedItemsSection({
		limit: 6,
		enabled: true
	});

	// Get page from query param, default to 1
	const pageParam = searchParams.get('page');
	const page = pageParam ? parseInt(pageParam, 10) : 1;
	const perPage = useLayoutTheme().itemsPerPage ?? 12;
	const start = (page - 1) * perPage;

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

	// Paginate filtered items
	const paginatedItems = useMemo(() => {
		return filteredItems.slice(start, start + perPage);
	}, [filteredItems, start, perPage]);

	// Reset page to 1 when filters change
	useEffect(() => {
		// Only reset if page is not 1 and filters change
		if (page !== 1) {
			const params = new URLSearchParams(Array.from(searchParams.entries()));
			params.set('page', '1');
			window.history.replaceState({}, '', `?${params.toString()}`);
		}
	}, [selectedTags, selectedCategories, searchTerm, searchParams, page]);

	// Client-side pagination state for Home 1
	const [currentPage, setCurrentPage] = useState(1);

	// Filter and sort items for Home 1 using shared utility
	const filteredAndSortedItems = useMemo(() => {
		let filtered = filterItems(props.items, {
			selectedCategories,
			searchTerm,
			selectedTags
		});

		// Sort items based on selected sort option
		if (sortBy === 'name-asc') {
			filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
		} else if (sortBy === 'name-desc') {
			filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
		} else if (sortBy === 'date-desc') {
			filtered = [...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
		} else if (sortBy === 'date-asc') {
			filtered = [...filtered].sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
		}
		// Default is popularity (no sorting needed)

		// Sort items with featured items first
		return sortItemsWithFeatured(filtered, featuredItems);
	}, [props.items, selectedCategories, searchTerm, selectedTags, sortBy, featuredItems]);

	// Calculate paginated items for Home 1
	const homeOnePaginatedItems = useMemo(() => {
		const start = (currentPage - 1) * PER_PAGE;
		const end = start + PER_PAGE;
		return filteredAndSortedItems.slice(start, end);
	}, [filteredAndSortedItems, currentPage]);

	// Calculate total pages for Home 1
	const totalPagesCount = useMemo(() => {
		return totalPages(filteredAndSortedItems.length);
	}, [filteredAndSortedItems.length]);

	// Handle page change for Home 1
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Sync URL params to filters only after mount to avoid hydration mismatch
	useEffect(() => {
		setIsMounted(true);

		const tagsParam = searchParams.get('tags');
		if (tagsParam) {
			setSelectedTags(tagsParam.split(','));
		}

		const categoriesParam = searchParams.get('categories');
		if (categoriesParam) {
			setSelectedCategories(categoriesParam.split(','));
		}
	}, [searchParams, setSelectedTags, setSelectedCategories]);

	if (layoutHome === LayoutHome.HOME_ONE) {
		return (
			<div className={LAYOUT_STYLES.mainContainer} suppressHydrationWarning>
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
								items={paginationType === 'infinite' ? filteredAndSortedItems : homeOnePaginatedItems}
								filteredCount={filteredAndSortedItems.length}
								totalCount={props.items.length}
							/>
						</div>

						{/* Pagination - Only show if needed */}
						{paginationType === 'standard' && totalPagesCount > 1 && (
							<div className={LAYOUT_STYLES.pagination}>
								<Paginate
									basePath={props.basePath}
									initialPage={currentPage}
									total={totalPagesCount}
									onPageChange={handlePageChange}
									paginationType={paginationType}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={LAYOUT_STYLES.mainContainer} suppressHydrationWarning>
			<HomeTwoLayout
				{...props}
				categories={sortedCategories}
				tags={sortedTags}
				filteredAndSortedItems={filteredItems}
				paginatedItems={paginatedItems}
			/>
		</div>
	);
}
