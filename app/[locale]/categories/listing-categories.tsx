"use client";
import { Category, ItemData, Tag } from "@/lib/content";
import { Categories, Paginate } from "@/components/filters";
import { totalPages } from "@/lib/paginate";
import { sortByNumericProperty } from "@/lib/utils";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";
import { ListingClient } from "@/components/shared-card/listing-client";
import { useStickyHeader } from "@/hooks/use-sticky-state";
import { CardPresets } from "@/components/shared-card";
import ViewToggle from "@/components/view-toggle";
import { useLayoutTheme } from "@/components/context";
import { SearchInput } from "@/components/ui/search-input";
import { useFilters } from "@/hooks/use-filters";
import SortMenu, { SortOption } from "@/components/sort-menu";
import { ItemsCategories } from "@/components/items-categories";

type ListingCategoriesProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

// Component for Home_1 layout
function HomeOneLayout({
  total,
  sortedCategories,
  items,
  start,
  page,
  basePath,
  categories: allCategories,
  tags,
}: {
  total: number;
  sortedCategories: Category[];
  items: ItemData[];
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
}) {
  return (
    <div className="pb-12 w-full mt-8">
      <div className="flex flex-col md:flex-row w-full gap-5">
        <div className="md:sticky md:top-4 md:self-start">
          <Categories total={total} categories={sortedCategories} />
        </div>
        <div className="w-full">
          <ListingClient
            items={items}
            total={total}
            start={start}
            page={page}
            basePath={basePath}
            categories={allCategories}
            tags={tags}
          />
        </div>
      </div>
    </div>
  );
}

function HomeTwoLayout({
  sortedCategories,
  isSticky,
  items,
  total,
  start,
  page,
  basePath,
  categories: allCategories,
  tags,
}: {
  sortedCategories: Category[];
  isSticky: boolean;
  items: ItemData[];
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
}) {
  const { layoutKey, setLayoutKey } = useLayoutTheme();
  const { searchTerm, setSearchTerm, setSortBy, sortBy } = useFilters();
  const t = useTranslations();

  const sortOptions: SortOption[] = [
    { value: "popularity", label: t("listing.POPULARITY") },
    { value: "name-asc", label: t("listing.NAME_A_Z") },
    { value: "name-desc", label: t("listing.NAME_Z_A") },
    { value: "date-asc", label: t("listing.OLDEST") },
  ];

  return (
    <div>
      <div
        className={`md:sticky md:top-4 md:self-start pt-6 sm:pt-8 md:pt-11 z-10 flex flex-col ${
          isSticky
            ? "bg-white/95 dark:bg-gray-800/90 shadow-md backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        {/* Mobile Layout */}
        <div className="block md:hidden space-y-3 px-2">
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
        <div className="hidden md:flex items-center justify-between px-2 gap-4">
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
        
        {/* Categories - Always visible */}
        <div className="mt-3 sm:mt-4">
          <ItemsCategories
            categories={sortedCategories}
            basePath={`/categories/category`}
            resetPath={`/categories`}
            enableSticky={false}
            maxVisibleTags={4}
          />
        </div>
      </div>
      <div className="md:h-4 md:w-full" />
      <ListingClient
        items={items}
        total={total}
        start={start}
        page={page}
        basePath={basePath}
        categories={allCategories}
        tags={tags}
        config={CardPresets.showViewToggle}
      />
    </div>
  );
}

function ListingCategories(props: ListingCategoriesProps) {
  const { layoutHome = "Home_1" } = useLayoutTheme();
  const t = useTranslations("listing");
  const { categories, total, page, basePath, items, start, tags } = props;
  const { isSticky } = useStickyHeader({ enableSticky: true });

  const sortedCategories = useMemo(
    () => sortByNumericProperty(categories),
    [categories]
  );

  const heroTitle = useMemo(
    () => (
      <span className="bg-gradient-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
        Discover Categories
      </span>
    ),
    []
  );

  return (
    <Hero
      badgeText={t("CATEGORIES")}
      title={heroTitle}
      description="Browse all categories in our directory"
      className="min-h-screen text-center"
    >
      {layoutHome === "Home_1" && (
        <HomeOneLayout
          total={total}
          sortedCategories={sortedCategories}
          items={items}
          start={start}
          page={page}
          basePath={basePath}
          categories={categories}
          tags={tags}
        />
      )}
      {layoutHome === "Home_2" && (
        <HomeTwoLayout
          sortedCategories={sortedCategories}
          isSticky={isSticky}
          items={items}
          total={total}
          start={start}
          page={page}
          basePath={basePath}
          categories={categories}
          tags={tags}
        />
      )}
      <footer className="flex items-center justify-center">
        <Paginate
          basePath={basePath}
          initialPage={page}
          total={totalPages(items.length)}
        />
      </footer>
    </Hero>
  );
}
export default ListingCategories;
