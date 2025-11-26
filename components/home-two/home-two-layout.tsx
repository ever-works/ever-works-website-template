"use client";

import { Category, ItemData, Tag } from "@/lib/content";
import { HomeTwoFilters } from "./home-two-filters";
import { useLayoutTheme } from "../context";
import { useStickyState } from "@/hooks/use-sticky-state";
import { ListingClient } from "../shared-card/listing-client";
import { CardPresets } from "../shared-card";
import clsx from "clsx";

// Style constants for sticky header
const STICKY_CONTAINER_BASE = clsx(
  "sticky top-12 z-20",
  "transition-all duration-300 ease-in-out",
  "rounded-lg"
);

const STICKY_CONTAINER_ACTIVE = clsx(
  STICKY_CONTAINER_BASE,
  "bg-white/95 dark:bg-gray-800/95",
  "shadow-md backdrop-blur-xs",
  "border border-gray-100 dark:border-gray-700/50",
  "px-4 py-3"
);

const STICKY_CONTAINER_INACTIVE = clsx(
  STICKY_CONTAINER_BASE,
  "bg-transparent"
);

type Home2LayoutProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
  filteredAndSortedItems: ItemData[];
  searchEnabled?: boolean;
};

export function HomeTwoLayout(props: Home2LayoutProps) {
  const { layoutKey, setLayoutKey, itemsPerPage } = useLayoutTheme();
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
          className={isSticky ? STICKY_CONTAINER_ACTIVE : STICKY_CONTAINER_INACTIVE}
        >
          <HomeTwoFilters
            categories={props.categories}
            tags={props.tags}
            layoutKey={layoutKey}
            setLayoutKey={setLayoutKey}
            totalCount={props.items.length}
            filteredCount={props.filteredAndSortedItems.length}
            searchEnabled={props.searchEnabled}
          />
        </div>
        <ListingClient
          total={props.total}
          start={props.start}
          page={props.page}
          basePath={props.basePath}
          categories={props.categories}
          tags={props.tags}
          items={props.filteredAndSortedItems}
          config={{ ...CardPresets.homeTwoListing, perPage: itemsPerPage }}
        />
      </div>
    </div>
  );
}
