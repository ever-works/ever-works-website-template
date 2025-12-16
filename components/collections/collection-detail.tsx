"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Collection } from "@/types/collection";
import { ItemData, Tag } from "@/lib/content";
import { Container, useContainerWidth } from "@/components/ui/container";
import { ListingClient } from "@/components/shared-card/listing-client";
import { FilterProvider } from "@/components/filters/context/filter-context";
import { Tags } from "@/components/filters/components/tags/tags-section";
import { sortByNumericProperty, filterItems } from "@/lib/utils";
import { useFilters } from "@/hooks/use-filters";
import { TopLoadingBar } from "@/components/ui/top-loading-bar";
import Hero from "@/components/hero";
import { LayoutHome, useLayoutTheme } from "@/components/context";
import { HomeTwoLayout } from "@/components/home-two";
import { sortItemsWithFeatured } from "@/lib/utils/featured-items";
import { useFeaturedItemsSection } from "@/hooks/use-feature-items-section";
import { SortControl } from "@/components/filters/components/controls/sort-control";

interface CollectionDetailProps {
  collection: Collection;
  tags: Tag[];
  items: ItemData[];
  total: number;
  start: number;
  page: number;
  basePath: string;
}

const LAYOUT_STYLES = {
  mobileOnly: 'lg:hidden z-10',
  desktopOnly: 'hidden lg:block z-10',
  mainContainer: 'pb-8 sm:pb-10 md:pb-12 lg:pb-16 xl:pb-20',
  contentWrapper: 'flex flex-col lg:flex-row w-full gap-2 sm:gap-3 md:gap-4 lg:gap-4 xl:gap-5',
  contentWrapperFluid: 'flex flex-col lg:flex-row w-full gap-2 sm:gap-3 md:gap-3 lg:gap-3 xl:gap-4',
  sidebar: 'lg:sticky lg:top-4 lg:self-start lg:w-64 lg:flex-shrink-0',
  sidebarFluid: 'lg:sticky lg:top-4 lg:self-start lg:w-80 xl:w-[340px] 2xl:w-[380px] lg:flex-shrink-0',
  sidebarMobile: 'mb-3 sm:mb-4 md:mb-5 lg:mb-0',
  mainContent: 'w-full flex-1 min-w-0',
};

function CollectionDetailContent(props: CollectionDetailProps) {
  const { collection, tags, items } = props;
  const t = useTranslations();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { layoutHome = LayoutHome.HOME_ONE } = useLayoutTheme();
  const { searchTerm, selectedTags, isFiltersLoading, sortBy, setSortBy } = useFilters();
  
  const sortedTags = sortByNumericProperty(tags);

  // Use the featured items hook
  const { featuredItems } = useFeaturedItemsSection({
    limit: 6,
    enabled: false // Disable featured items for collection pages
  });

  // Filtering logic using shared utility
  const filteredItems = useMemo(() => {
    const filtered = filterItems(items, {
      searchTerm,
      selectedTags
    });
    return sortItemsWithFeatured(filtered, featuredItems);
  }, [items, searchTerm, selectedTags, featuredItems]);

  // Get container width to conditionally apply styles
  const containerWidth = useContainerWidth();
  const isFluid = containerWidth === 'fluid';

  // Check if description is long (more than 200 characters)
  const isLongDescription = collection.description.length > 200;
  const displayDescription = isDescriptionExpanded || !isLongDescription 
    ? collection.description 
    : collection.description.slice(0, 200) + '...';

  // Render HOME_TWO layout if selected
  if (layoutHome === LayoutHome.HOME_TWO) {
    return (
      <>
        <TopLoadingBar isLoading={isFiltersLoading} />
        <Hero
          badgeText={t("common.COLLECTION")}
          title={
            <div className="flex flex-col items-center gap-4">
              {collection.icon_url && (
                <div className="text-4xl text-gray-900 dark:text-white">{collection.icon_url}</div>
              )}
              <span className="bg-linear-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent inline-block leading-tight">
                {collection.name}
              </span>
            </div>
          }
          description={
            <>
              <span className="text-gray-600 dark:text-gray-400 text-lg block">
                {displayDescription}
              </span>
              {isLongDescription && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 inline-flex text-theme-primary hover:text-theme-primary/80 text-sm font-medium transition-colors duration-200"
                >
                  {isDescriptionExpanded ? t("common.SHOW_LESS") : t("common.SHOW_MORE", { count: "" })}
                </button>
              )}
            </>
          }
          className="min-h-screen text-center"
        >
          <div className="pb-8 sm:pb-10 md:pb-12 lg:pb-16 xl:pb-20">
            <HomeTwoLayout
              {...props}
              categories={[]}
              tags={sortedTags}
              filteredAndSortedItems={filteredItems}
              searchEnabled={true}
            />
          </div>
        </Hero>
      </>
    );
  }

  // HOME_ONE layout (default)
  return (
    <>
      <TopLoadingBar isLoading={isFiltersLoading} />
      <Hero
        badgeText={t("common.COLLECTION")}
        title={
          <div className="flex flex-col items-center gap-4">
             {collection.icon_url && (
              <div className="text-5xl text-gray-900 dark:text-white">{collection.icon_url}</div>
            )}
            <span className="bg-linear-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent inline-block leading-tight">
              {collection.name}
            </span>
          </div>
        }
        description={
          <>
            <span className="text-gray-600 dark:text-gray-400 text-lg block">
              {displayDescription}
            </span>
            {isLongDescription && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 inline-flex text-theme-primary hover:text-theme-primary/80 text-sm font-medium transition-colors duration-200"
              >
                {isDescriptionExpanded ? t("common.SHOW_LESS") : t("common.SHOW_MORE", { count: "" })}
              </button>
            )}
          </>
        }
        className="min-h-screen text-center"
      >
        <Container maxWidth="7xl" padding="default" useGlobalWidth className="py-0 mt-0">
          <div className={LAYOUT_STYLES.mainContainer}>
            <div className="w-full">
              {/* Tags Section - Mobile version */}
              {sortedTags.length > 0 && (
                <div className={`lg:sticky lg:top-4 mb-4 sm:mb-6 md:mb-8 ${LAYOUT_STYLES.mobileOnly}`}>
                  <Tags tags={sortedTags} enableSticky={false} maxVisibleTags={3} allItems={props.items} />
                </div>
              )}
              {/* Tags Section - Desktop version */}
              {sortedTags.length > 0 && (
                <div className={`lg:sticky lg:top-4 mb-4 sm:mb-6 md:mb-8 ${LAYOUT_STYLES.desktopOnly}`}>
                  <Tags tags={sortedTags} enableSticky={true} maxVisibleTags={isFluid ? 8 : 5} allItems={props.items} />
                </div>
              )}

              {/* Listing Content */}
              <div className="mb-6 sm:mb-8 md:mb-10 space-y-10">
                <div className="flex w-full flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 md:-mb-8">
                  <SortControl
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    className="w-full sm:w-auto max-w-full sm:max-w-40"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                   Showing {filteredItems.length} items
                  </span>
                </div>
                <ListingClient
                  {...props}
                  categories={[]}
                  items={filteredItems}
                  totalCount={props.items.length}
                  config={{
                    showStats: false,
                    showViewToggle: true,
                    showFilters: false,
                    showPagination: true,
                    showEmptyState: true,
                    enableSearch: true,
                    enableTagFilter: false,
                    enableSorting: true,
                  }}
                />
              </div>
            </div>
          </div>
        </Container>
      </Hero>
    </>
  );
}

export function CollectionDetail(props: CollectionDetailProps) {
  return (
    <FilterProvider>
      <CollectionDetailContent {...props} />
    </FilterProvider>
  );
}
