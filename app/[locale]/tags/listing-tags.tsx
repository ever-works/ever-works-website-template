"use client";
import { Category, ItemData, Tag } from "@/lib/content";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { Tags } from "@/components/filters/components/tags/tags-section";
import { totalPages } from "@/lib/paginate";
import { sortByNumericProperty } from "@/lib/utils";
import { useMemo } from "react";
import SortMenu, { SortOption } from "@/components/sort-menu";
import { LayoutHome, useLayoutTheme } from "@/components/context/LayoutThemeContext";
import ViewToggle from "@/components/view-toggle";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";
import { useStickyHeader } from "@/hooks/use-sticky-state";
import { ListingClient } from "@/components/shared-card/listing-client";
import { CardPresets } from "@/components/shared-card";
import { SearchInput } from "@/components/ui/search-input";
import { useFilters } from "@/hooks/use-filters";
import { TagsItemsColumn } from "@/components/tags-items-column";

type ListingTagsProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

function ListingTags(props: ListingTagsProps) {
  const { searchTerm, setSearchTerm, setSortBy, sortBy } = useFilters();
  const { layoutKey, setLayoutKey, layoutHome = LayoutHome.HOME_ONE } = useLayoutTheme();
  const t = useTranslations("listing");
  const { isSticky } = useStickyHeader({ enableSticky: true });

  const sortedTags = useMemo(
    () => sortByNumericProperty(props.tags),
    [props.tags]
  );

  const sortOptions: SortOption[] = [
    { value: "popularity", label: t("POPULARITY") },
    { value: "name-asc", label: t("NAME_A_Z") },
    { value: "name-desc", label: t("NAME_Z_A") },
    { value: "date-asc", label: t("OLDEST") },
  ];

  // Render functions
  const renderFilters = () => (
    <div
      className={`md:sticky md:top-4 md:self-start pt-8 sm:pt-10 md:pt-12 z-10 w-full ${
        isSticky
          ? "bg-white/95 dark:bg-gray-800/90 shadow-md backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      {/* Mobile Layout */}
      <div className="block md:hidden space-y-3 px-3">
        {/* Search Bar - Full Width */}
        <div className="w-full">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="w-full"
          />
        </div>

        {/* Sort and View in one row */}
        <div className="flex items-center justify-between gap-2">
          <SortMenu
            className="h-8 flex-1 text-xs sm:text-sm"
            options={sortOptions}
            value={sortBy}
            onSortChange={setSortBy}
            ariaLabel="Sort items"
          />
          <ViewToggle
            activeView={layoutKey}
            onViewChange={(newView) => setLayoutKey(newView)}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col gap-4 px-3">
        <div className="flex justify-between items-center">
          <SortMenu
            className="h-8 min-w-[180px] text-sm"
            options={sortOptions}
            value={sortBy}
            onSortChange={setSortBy}
            ariaLabel="Sort items"
          />
          <div className="flex items-center gap-3">
            <div className="w-64 lg:w-80">
              <SearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            <ViewToggle
              activeView={layoutKey}
              onViewChange={(newView) => setLayoutKey(newView)}
            />
          </div>
        </div>
      </div>

      {/* Tags - Always visible */}
      <div className="mt-3 sm:mt-4">
        <Tags
          tags={sortedTags}
          basePath={`/tags/tag`}
          resetPath={`/tags`}
          enableSticky={false}
          maxVisibleTags={6}
          total={props.total}
        />
      </div>
    </div>
  );

  return (
    <Hero
      badgeText={t("TAGS")}
      title={
        <span className="bg-gradient-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 bg-clip-text text-transparent">
          Discover Tags
        </span>
      }
      description="Browse all tags in our directory"
      className="min-h-screen text-center"
    >
      {layoutHome === LayoutHome.HOME_TWO && renderFilters()}

      <div className="flex flex-col md:flex-row items-start gap-8 ">
        {layoutHome === LayoutHome.HOME_ONE && (
          <div className="hidden md:block md:sticky md:top-4 md:self-start  z-10 w-full md:max-w-64">
            <TagsItemsColumn tag={sortedTags} total={props.total} />
          </div>
        )}
        <ListingClient
          {...props}
          config={
            layoutHome === LayoutHome.HOME_ONE
              ? CardPresets.fullListing
              : CardPresets.showViewToggle
          }
        />
      </div>

      <footer className="flex items-center justify-center mt-12">
        <Paginate
          basePath={props.basePath}
          initialPage={props.page}
          total={totalPages(props.items.length)}
        />
      </footer>
    </Hero>
  );
}
export default ListingTags;
