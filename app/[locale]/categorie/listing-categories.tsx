"use client";
import { Category, ItemData, Tag } from "@/lib/content";
import { Categories, FilterProvider, Paginate } from "@/components/filters";
import { totalPages } from "@/lib/paginate";
import { sortByNumericProperty } from "@/lib/utils";
import { useMemo } from "react";
import { useLayoutTheme } from "@/components/context/LayoutThemeContext";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";
import { ListingClient } from "@/components/shared-card/listing-client";
import { HomeTwoCategories } from "@/components/home-two";
import { Container } from "@/components/ui/container";
import { useStickyHeader } from "@/hooks/use-sticky-state";

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
  const {  categories } = props;
  const { isSticky } = useStickyHeader({ enableSticky: true });

  const sortedCategories = useMemo(
    () => sortByNumericProperty(categories),
    [categories]
  );

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
              {/* <div ref={sentinelRef} className="md:h-4 md:w-full" /> */}
              <div
                // ref={targetRef}
                className={`md:sticky md:top-4 md:self-start py-11 z-10 ${
                  isSticky
                    ? "bg-white/95 dark:bg-gray-800/90 shadow-md backdrop-blur-sm"
                    : "bg-transparent"
                }`}
              >
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
