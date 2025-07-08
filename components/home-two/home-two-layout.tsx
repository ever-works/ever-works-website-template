"use client";

import { Category, ItemData, Tag } from "@/lib/content";
import { totalPages } from "@/lib/paginate";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { HomeTwoFilters } from "./home-two-filters";
import { useLayoutTheme } from "../context";
import { useStickyState } from "@/hooks/use-sticky-state";
import { ListingClient } from "../shared-card/listing-client";
import { CardPresets } from "../shared-card";

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
      <div className="max-w-7xl flex flex-col gap-4 py-8 w-full">
        <div ref={sentinelRef} className="md:h-4 md:w-full" />
        <div
          ref={targetRef}
          className={`sticky top-4 z-10 ${
            isSticky
              ? "bg-white/95 dark:bg-gray-800/95 shadow-md backdrop-blur-sm"
              : "bg-transparent"
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
        <ListingClient 
          {...props}
          items={props.paginatedItems}
          filteredCount={props.filteredAndSortedItems.length}
          totalCount={props.items.length}
          config={CardPresets.showViewToggle} 
        />
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
