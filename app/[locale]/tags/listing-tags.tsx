"use client";
import { Category, ItemData, Tag } from "@/lib/content";
import { Paginate, Tags } from "@/components/filters";
import { totalPages } from "@/lib/paginate";
import { sortByNumericProperty } from "@/lib/utils";
import { useMemo } from "react";
import SortMenu, { SortOption } from "@/components/sort-menu";
import { useLayoutTheme } from "@/components/context/LayoutThemeContext";
import ViewToggle from "@/components/view-toggle";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";
import { useStickyHeader } from "@/hooks/use-sticky-state";
import { Container } from "@/components/ui/container";
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
  const { layoutKey, setLayoutKey, layoutHome = "Home_1" } = useLayoutTheme();
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

  return (
    <Hero
      badgeText={t("TAGS")}
      title={
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
          Discover Tags
        </span>
      }
      description="Browse all tags in our directory"
      className="min-h-screen"
    >
      <Container>
        {layoutHome === "Home_2" && (
          <div
            className={`md:sticky md:top-4 md:self-start py-8 z-10 w-full ${
              isSticky
                ? "bg-white/95 dark:bg-gray-800/90 shadow-md backdrop-blur-sm"
                : "bg-transparent"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end px-3 gap-4 sm:gap-0">
              <SortMenu
                className="h-8 min-w-[180px] text-sm"
                options={sortOptions}
                value={sortBy}
                onSortChange={setSortBy}
                ariaLabel="Sort items"
              />
              <div className="flex items-center gap-3">
                <SearchInput
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
                <ViewToggle
                  activeView={layoutKey}
                  onViewChange={(newView) => setLayoutKey(newView)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Tags
                tags={sortedTags}
                basePath={`/tag/tag`}
                resetPath={`/tag`}
                enableSticky={false}
                maxVisibleTags={7}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start gap-8 ">
          {layoutHome === "Home_1" && (
            <div className="hidden md:block md:sticky md:top-4 md:self-start  z-10 w-full md:max-w-64">
              <TagsItemsColumn tag={sortedTags} total={sortedTags.length} />
            </div>
          )}
          <ListingClient {...props} config={CardPresets.showViewToggle} />
        </div>

        <footer className="flex items-center justify-center mt-12">
          <Paginate
            basePath={props.basePath}
            initialPage={props.page}
            total={totalPages(props.items.length)}
          />
        </footer>
      </Container>
    </Hero>
  );
}
export default ListingTags;
