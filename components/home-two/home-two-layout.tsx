"use client";

import { Category, ItemData, Tag } from "@/lib/content";
import { totalPages } from "@/lib/paginate";
import { Paginate } from "@/components/filters";
import { HomeTwoFilters } from "./home-two-filters";
import { HomeTwoResults } from "./home-two-results";
import { useLayoutTheme } from "../context";

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
  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-8 w-full">
        <HomeTwoFilters 
          categories={props.categories} 
          tags={props.tags} 
          items={props.items}
          layoutKey={layoutKey}
          setLayoutKey={setLayoutKey}
        />
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