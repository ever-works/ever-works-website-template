"use client";

import { Category, ItemData, Tag } from "@/lib/content";
import { totalPages } from "@/lib/paginate";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { HomeTwoFilters } from "./home-two-filters";
import { useLayoutTheme } from "../context";
import { useStickyState } from "@/hooks/use-sticky-state";
import { ListingClient } from "../shared-card/listing-client";
import { CardPresets } from "../shared-card";
import { useState, useMemo } from "react";
import { PER_PAGE } from "@/lib/paginate";
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
  "shadow-md backdrop-blur-sm",
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
  paginatedItems: ItemData[];
};

export function HomeTwoLayout(props: Home2LayoutProps) {
  const { layoutKey, setLayoutKey, paginationType } = useLayoutTheme();
  const { isSticky, sentinelRef, targetRef } = useStickyState({
    threshold: 0,
    rootMargin: "-20px 0px 0px 0px",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    return props.filteredAndSortedItems.slice(start, end);
  }, [props.filteredAndSortedItems, currentPage]);

  const totalPagesCount = useMemo(() => {
    return totalPages(props.filteredAndSortedItems.length);
  }, [props.filteredAndSortedItems.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

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
            onFilterChange={resetToFirstPage}
            totalCount={props.items.length}
            filteredCount={props.filteredAndSortedItems.length}
          />
        </div>
        <ListingClient 
          total={props.total}
          start={props.start}
          page={props.page}
          basePath={props.basePath}
          categories={props.categories}
          tags={props.tags}
          items={paginatedItems}
          filteredCount={props.filteredAndSortedItems.length}
          totalCount={props.items.length}
          config={CardPresets.homeTwoListing}
        />
        {totalPagesCount > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <Paginate
              basePath={props.basePath}
              initialPage={currentPage}
              total={totalPagesCount}
              onPageChange={handlePageChange}
              paginationType={paginationType}
            />
          </div>
        )}
      </div>
    </div>
  );
}
