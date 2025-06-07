"use client";

import { Category, ItemData, Tag } from "@/lib/content";
import { totalPages } from "@/lib/paginate";
import { Paginate } from "@/components/filters";
import { HomeTwoFilters } from "./home-two-filters";
import { HomeTwoResults } from "./home-two-results";
import { useLayoutTheme } from "../context";
import { useStickyState } from "@/hooks/use-sticky-state";

type Home2LayoutProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
  filteredAndSortedItems: ItemData[];
  paginatedItems: ItemData[];
};

export function HomeTwoLayout(props: Home2LayoutProps) {
  const { layoutKey, setLayoutKey } = useLayoutTheme();
  const { isSticky, sentinelRef, targetRef } = useStickyState({
    threshold: 0,
    rootMargin: "-20px 0px 0px 0px",
  });

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="container max-w-7xl px-4 flex flex-col gap-4 py-8 w-full">
        <div ref={sentinelRef} className="md:h-4 md:w-full" />
        <div
          ref={targetRef}
          className={`md:sticky md:top-4 md:self-start z-10 md:transition-all md:duration-300  ${
            isSticky
              ? "md:bg-white md:dark:bg-gray-900 md:shadow-lg md:rounded-lg md:p-4 md:pt-24"
              : "md:bg-transparent md:p-0"
          }`}
        >
          <HomeTwoFilters
            categories={props.categories}
            tags={props.tags}
            items={props.items}
            layoutKey={layoutKey}
            setLayoutKey={setLayoutKey}
          />
        </div>
        <HomeTwoResults items={props.paginatedItems} layoutKey={layoutKey} />
        <div className="mt-8 flex items-center justify-center">
          <Paginate
            basePath={props.basePath}
            initialPage={props.page}
            total={totalPages(props.filteredAndSortedItems.length)}
          />
        </div>
      </div>
    </div>
  );
}
