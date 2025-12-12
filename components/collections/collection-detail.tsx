"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Collection } from "@/types/collection";
import { Category, ItemData, Tag } from "@/lib/content";
import { Container, useContainerWidth } from "@/components/ui/container";
import { ListingClient } from "@/components/shared-card/listing-client";
import { FilterProvider } from "@/components/filters/context/filter-context";
import { Categories } from "@/components/filters/components/categories/categories-section";
import { Tags } from "@/components/filters/components/tags/tags-section";
import { sortByNumericProperty, filterItems } from "@/lib/utils";
import { useFilters } from "@/hooks/use-filters";
import { TopLoadingBar } from "@/components/ui/top-loading-bar";
import Hero from "@/components/hero";

interface CollectionDetailProps {
  collection: Collection;
  categories: Category[];
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
  const { collection, categories, tags, items } = props;
  const t = useTranslations();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { selectedCategories, searchTerm, selectedTags, isFiltersLoading } = useFilters();
  
  const sortedTags = sortByNumericProperty(tags);
  const sortedCategories = sortByNumericProperty(categories);

  // Filtering logic using shared utility
  const filteredItems = useMemo(() => {
    return filterItems(items, {
      searchTerm,
      selectedTags,
      selectedCategories
    });
  }, [items, searchTerm, selectedTags, selectedCategories]);

  // Get container width to conditionally apply styles
  const containerWidth = useContainerWidth();
  const isFluid = containerWidth === 'fluid';

  // Check if description is long (more than 200 characters)
  const isLongDescription = collection.description.length > 200;
  const displayDescription = isDescriptionExpanded || !isLongDescription 
    ? collection.description 
    : collection.description.slice(0, 200) + '...';

  return (
    <>
      <TopLoadingBar isLoading={isFiltersLoading} />
      <Hero
        badgeText={t("common.COLLECTION")}
        title={
          <div className="flex flex-col items-center gap-4">
             {collection.icon_url && (
              <div className="text-5xl">{collection.icon_url}</div>
            )}
            <span className="bg-linear-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
              {collection.name}
            </span>
          </div>
        }
        description={
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {displayDescription}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-theme-primary hover:text-theme-primary/80 text-sm font-medium transition-colors duration-200"
              >
                {isDescriptionExpanded ? t("common.SHOW_LESS") : t("common.SHOW_MORE", { count: "" })}
              </button>
            )}
          </div>
        }
        className="min-h-screen text-center"
      >
        <Container maxWidth="7xl" padding="default" useGlobalWidth>
          {/* Breadcrumb */}
          <nav className="flex mb-8 justify-center" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center text-black dark:text-white">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-black dark:text-white hover:text-white dark:hover:text-white transition-colors duration-300"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  {t("common.HOME")}
                </Link>
              </li>
              <li>
                <div className="flex items-center text-black dark:text-white">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <Link
                    href="/collections"
                    className="ml-1 text-sm font-medium md:ml-2 hover:text-theme-primary transition-colors duration-200"
                  >
                    {t("common.COLLECTION")}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center text-black dark:text-white">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium md:ml-2">
                    {collection.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className={LAYOUT_STYLES.mainContainer}>
            <div className={isFluid ? LAYOUT_STYLES.contentWrapperFluid : LAYOUT_STYLES.contentWrapper}>
              {/* Sidebar - Categories */}
              {sortedCategories.length > 0 && (
                <div className={`${isFluid ? LAYOUT_STYLES.sidebarFluid : LAYOUT_STYLES.sidebar} ${LAYOUT_STYLES.sidebarMobile}`}>
                  <Categories total={props.total} categories={sortedCategories} tags={sortedTags} />
                </div>
              )}

              {/* Main Content */}
              <div className={LAYOUT_STYLES.mainContent}>
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
