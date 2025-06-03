"use client";
import { useLayoutTheme } from "@/components/context";
import { Categories, Paginate, Tags } from "@/components/filters";
import { Tag, Category, ItemData } from "@/lib/content";
import { sortByNumericProperty } from "@/lib/utils";
import { totalPages } from "@/lib/paginate";
import { ListingClient } from "./listing-client";
import { HomeTwoLayout, useHomeTwoLogic } from "@/components/home-two";
import { useStickyState } from "@/hooks/use-sticky-state";

type ListingProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

export default function GlobelsClient(props: ListingProps) {
  const { layoutHome } = useLayoutTheme();

  const { isSticky, sentinelRef, targetRef } = useStickyState({
    threshold: 0,
  });

  const homeTwoLogic = useHomeTwoLogic({
    ...props,
  });
  const sortedTags = sortByNumericProperty(props.tags);
  const sortedCategories = sortByNumericProperty(props.categories);

  const {
    isSticky: isCategoriesSticky,
    sentinelRef: categoriesSentinelRef,
    targetRef: categoriesTargetRef,
  } = useStickyState({
    threshold: 0,
    rootMargin: "-20px 0px 0px 0px",
  });

  return layoutHome === "Home_1" ? (
    <div className=" px-4 pb-12">
      <div className="flex flex-col md:flex-row w-full gap-5">
        <div className="md:sticky md:top-4 md:self-start">
          <div ref={categoriesSentinelRef} className="md:h-4 md:w-full" />
          {/* 0788968051 */}
          <div
            ref={categoriesTargetRef}
            className={`sticky top-4 z-10 transition-all duration-300 ${
              isCategoriesSticky
                ? "bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 mb-4 border-2"
                : "bg-transparent p-0"
            }`}
          >
            <Categories total={props.total} categories={sortedCategories} />
          </div>
        </div>
        <div className="w-full">
          <div ref={sentinelRef} className="md:h-4 md:w-full" />
          <div
            ref={targetRef}
            className={`sticky top-4 z-10 transition-all duration-300 ${
              isSticky
                ? "bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 mb-4 border-2"
                : "bg-transparent p-0"
            }`}
          >
            <Tags tags={sortedTags} />
          </div>
          <ListingClient {...props} />
          <div className="flex items-center justify-center">
            <Paginate
              basePath={props.basePath}
              initialPage={props.page}
              total={totalPages(props.items.length)}
            />
          </div>
        </div>
      </div>
    </div>
  ) : layoutHome === "Home_2" ? (
    <HomeTwoLayout
      {...props}
      categories={sortedCategories}
      tags={sortedTags}
      filteredAndSortedItems={homeTwoLogic.items}
      paginatedItems={homeTwoLogic.paginatedItems}
    />
  ) : (
    <div>
      <HomeTwoLayout
        {...props}
        categories={sortedCategories}
        tags={sortedTags}
        filteredAndSortedItems={homeTwoLogic.items}
        paginatedItems={homeTwoLogic.paginatedItems}
      />
    </div>
  );
}
