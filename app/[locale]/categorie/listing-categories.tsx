"use client";
import { Category, ItemData, Tag } from "@/lib/content";
import { Categories, FilterProvider, Paginate } from "@/components/filters";
import { PER_PAGE, totalPages } from "@/lib/paginate";
import { sortByNumericProperty } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useLayoutTheme } from "@/components/context/LayoutThemeContext";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";
import { ListingClient } from "@/components/shared-card/listing-client";
import { HomeTwoCategories } from "@/components/home-two";
import { Container } from "@/components/ui/container";

type ListingCategoriesProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

function ListingCategories(props: ListingCategoriesProps) {
  const { layoutHome = "Home_1" } = useLayoutTheme();
  const t = useTranslations("listing");
  const { items, start, categories } = props;
  const [sortBy, setSortBy] = useState("popularity");
  const paginatedCategories = items.slice(start, start + PER_PAGE);
  const sortedCategories = useMemo(
    () => sortByNumericProperty(categories),
    [categories]
  );

  const sortedItems = useMemo(() => {
    const arr = [...paginatedCategories];
    switch (sortBy) {
      case "name-asc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "date-desc":
        return arr
          .sort(
            (a, b) =>
              (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0)
          )
          .reverse();
      case "date-asc":
        return arr.sort(
          (a, b) =>
            (a.updatedAt?.getTime?.() || 0) - (b.updatedAt?.getTime?.() || 0)
        );
      case "popularity":
      default:
        return arr;
    }
  }, [paginatedCategories, sortBy]);

  return (
    <FilterProvider>
      <Hero
        badgeText={t("CATEGORIES")}
        title={
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Discover Categories
          </span>
        }
        description="Browse all categories in our directory"
        className="min-h-screen"
      >
        <Container>
          {layoutHome === "Home_1" && (
            <div className="pb-12 w-full mt-8">
              <div className="flex flex-col md:flex-row w-full gap-5">
                <div className="md:sticky md:top-4 md:self-start">
                  <Categories
                    total={props.total}
                    categories={sortedCategories}
                  />
                </div>
                <div className="w-full">
                  <ListingClient {...props} />
                </div>
              </div>
            </div>
          )}
          {layoutHome === "Home_2" && (
            <div className="mt-8 sticky top-0 z-10">
              {/* <div className="flex justify-between mb-6"> */}
              {/* <SortMenuenu
                className="h-8 min-w-[180px] text-sm"
                options={sortOptions}
                value={sortBy}
                onSortChange={setSortBy}
                ariaLabel="Sort items"
              /> */}
              {/* <ViewToggle
                    activeView={layoutKey}
                    onViewChange={(newView) => setLayoutKey(newView)}
                  />
                </div> */}

              <div className="md:sticky md:top-4 md:self-start py-4 ">
                <HomeTwoCategories
                  resetPath={`/categorie`}
                  categories={sortedCategories}
                  basePath={`/categorie/category`}
                />
              </div>
              <div className="md:h-4 md:w-full" />
              <ListingClient {...props} />
            </div>
          )}
          <footer className="flex items-center justify-center">
            <Paginate
              basePath={props.basePath}
              initialPage={props.page}
              total={totalPages(props.items.length)}
            />
          </footer>
        </Container>
      </Hero>
    </FilterProvider>
  );
}
export default ListingCategories;
