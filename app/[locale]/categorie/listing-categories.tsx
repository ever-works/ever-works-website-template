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
  return (
    <div className="mt-8 sticky top-0 z-10">
      <div
        className={`md:sticky md:top-4 md:self-start py-11 z-10 ${
          isSticky ? "bg-white/95 dark:bg-gray-800/90 shadow-md backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <HomeTwoCategories
          resetPath={`/categorie`}
          categories={sortedCategories}
          basePath={`/categorie/category`}
        />
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

  const heroTitle = useMemo(() => (
    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
      Discover Categories
    </span>
  ), []);

  return (
    <FilterProvider>
      <Hero
        badgeText={t("CATEGORIES")}
        title={heroTitle}
        description="Browse all categories in our directory"
        className="min-h-screen"
      >
        <Container>
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
        </Container>
      </Hero>
    </FilterProvider>
  );
}
export default ListingCategories;
