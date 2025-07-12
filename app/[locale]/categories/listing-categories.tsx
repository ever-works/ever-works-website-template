"use client";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";
import Link from "next/link";
import CategoriesGrid from "@/components/categories-grid";
import { Category, ItemData, Tag } from "@/lib/content";
import { useLayoutTheme, LayoutHome } from "@/components/context";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { totalPages } from "@/lib/paginate";
import SortMenu, { SortOption } from "@/components/sort-menu";
import ViewToggle from "@/components/view-toggle";
import { SearchInput } from "@/components/ui/search-input";
import { useFilters } from "@/hooks/use-filters";
import { ListingClient } from "@/components/shared-card/listing-client";
import { CardPresets } from "@/components/shared-card";

interface ListingCategoriesProps {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
}

export default function ListingCategories(props: ListingCategoriesProps) {
  const { layoutHome = LayoutHome.HOME_ONE, paginationType } = useLayoutTheme();
  const t = useTranslations("listing");

  return (
    <Hero
      badgeText={t("CATEGORIES")}
      title={
        <span className="bg-gradient-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
          {t("CATEGORIES", { defaultValue: "Open Source Software Categories" })}
        </span>
      }
      description={"Browse top categories to find your best Open Source software options."}
      className="min-h-screen text-center"
    >
      {layoutHome === LayoutHome.HOME_ONE && (
        <HomeOneLayout categories={props.categories} />
      )}
      {layoutHome === LayoutHome.HOME_TWO && (
        <HomeTwoLayout
          items={props.items}
          total={props.total}
          start={props.start}
          page={props.page}
          basePath={props.basePath}
          categories={props.categories}
          tags={props.tags}
        />
      )}
      {paginationType === "standard" && false && (
        <footer className="flex items-center justify-center">
          <Paginate
            basePath={props.basePath}
            initialPage={props.page}
            total={totalPages(props.items.length)}
          />
        </footer>
      )}
    </Hero>
  );
}

function HomeOneLayout({
  categories,
}: {
  categories: Category[];
}) {
  const t = useTranslations("listing");

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex mb-8 justify-center" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center text-black dark:text-white">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-black dark:text-white hover:text-white dark:hover:text-white transition-colors duration-300"
            >
              <svg
                className="w-3 h-3 mr-2.5 text-dark--theme-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-dark--theme-800 dark:text-white mx-1 "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-800 dark:text-white/50 md:ml-2 transition-colors duration-300">
                {t("CATEGORIES")}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Categories Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <CategoriesGrid categories={categories} />
      </div>
    </>
  );
}

function HomeTwoLayout({
  items,
  total,
  start,
  page,
  basePath,
  categories: allCategories,
  tags,
}: {
  items: ItemData[];
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
}) {
  const { layoutKey, setLayoutKey, paginationType } = useLayoutTheme();
  const { searchTerm, setSearchTerm, setSortBy, sortBy } = useFilters();
  const t = useTranslations();

  const sortOptions: SortOption[] = [
    { value: "popularity", label: t("listing.POPULARITY") },
    { value: "name-asc", label: t("listing.NAME_A_Z") },
    { value: "name-desc", label: t("listing.NAME_Z_A") },
    { value: "date-asc", label: t("listing.OLDEST") },
  ];

  // Calculate paginated items
  const perPage = useLayoutTheme().itemsPerPage ?? 12;
  const paginatedItems = items.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="md:sticky md:top-4 md:self-start pt-6 sm:pt-8 md:pt-11 z-10 flex flex-col">
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
              onSortChange={(value) => setSortBy(value as any)}
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
            onSortChange={(value) => setSortBy(value as any)}
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
      <div className="md:h-4 md:w-full" />
      <ListingClient
        items={paginationType === "infinite" ? items : paginatedItems}
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
