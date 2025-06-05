"use client";
import { useLayoutTheme } from "@/components/context";
import { Categories, Paginate, Tags } from "@/components/filters";
import { Tag, Category, ItemData } from "@/lib/content";
import { sortByNumericProperty } from "@/lib/utils";
import { totalPages } from "@/lib/paginate";
import { ListingClient } from "./listing-client";
import { HomeTwoLayout, useHomeTwoLogic } from "@/components/home-two";
import { useStickyState } from "@/hooks/use-sticky-state";
import { useEffect } from "react";

type ListingProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

export default function GlobalsClient(props: ListingProps) {
  const { layoutHome = "Home_1" } = useLayoutTheme();
  const { isSticky, sentinelRef, targetRef } = useStickyState({
    threshold: 0,
    rootMargin: "-20px 0px 0px 0px",
    debug: false,
  });

  const homeTwoLogic = useHomeTwoLogic(props);
  const sortedTags = sortByNumericProperty(props.tags);
  const sortedCategories = sortByNumericProperty(props.categories);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const container = document.getElementById("sticky-tags-container");
      if (container) {
        container.style.backgroundColor = isSticky
          ? document.documentElement.classList.contains("dark")
            ? "#111827"
            : "#ffffff"
          : "transparent";
      }
    }
  }, [isSticky]);

  if (layoutHome === "Home_1") {
    return (
      <div className="px-4 pb-12">
        <div className="flex flex-col md:flex-row w-full gap-5">
          <div className="md:sticky md:top-4 md:self-start">
            <Categories total={props.total} categories={sortedCategories} />
          </div>
          <div className="w-full">
            <div ref={sentinelRef} className="md:h-4 md:w-full" />
            <div
              ref={targetRef}
              className={`md:sticky md:top-4 z-10 transition-all duration-300 ${
                isSticky
                  ? "bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 mb-4"
                  : "bg-transparent p-0"
              }`}
              id="sticky-tags-container"
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
    );
  }

  return (
    <HomeTwoLayout
      {...props}
      categories={sortedCategories}
      tags={sortedTags}
      filteredAndSortedItems={homeTwoLogic.items}
      paginatedItems={homeTwoLogic.paginatedItems}
    />
  );
}
