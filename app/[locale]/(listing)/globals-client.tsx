"use client";
import { LayoutHome, useLayoutTheme } from "@/components/context";
import { Categories } from "@/components/filters/components/categories/categories-section";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { Tags } from "@/components/filters/components/tags/tags-section";
import { Tag, Category, ItemData } from "@/lib/content";
import { sortByNumericProperty } from "@/lib/utils";
import { HomeTwoLayout } from "@/components/home-two";
import { ListingClient } from "@/components/shared-card/listing-client";
import { useFilters } from "@/hooks/use-filters";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";

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
  const { layoutHome =LayoutHome.HOME_ONE } = useLayoutTheme();
  const sortedTags = sortByNumericProperty(props.tags);
  const sortedCategories = sortByNumericProperty(props.categories);
  const pathname = usePathname();

  // Detect if we're on a category page
  const isCategoryPage = pathname.includes('/categories/category/');
  const tagsMode = isCategoryPage ? "filter" : "navigation";

  const { setSelectedTags, selectedTags, searchTerm, selectedTag } = useFilters();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  // Get page from query param, default to 1
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const perPage = 12; // or use from config if needed
  const start = (page - 1) * perPage;

  // Filtering logic (same as useProcessedItems in Card)
  const filteredItems = useMemo(() => {
    let filtered = props.items;
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }
    if (selectedTags && selectedTags.length > 0) {
      filtered = filtered.filter((item) => {
        if (!item.tags?.length) return false;
        return selectedTags.some((selectedTagId) =>
          item.tags.some((itemTag) => (typeof itemTag === 'string' ? itemTag : itemTag.id) === selectedTagId)
        );
      });
    }
    if (selectedTag) {
      filtered = filtered.filter((item) => {
        if (!item.tags?.length) return false;
        return item.tags.some((itemTag) => (typeof itemTag === 'string' ? itemTag : itemTag.id) === selectedTag);
      });
    }
    return filtered;
  }, [props.items, searchTerm, selectedTags, selectedTag]);

  // Paginate filtered items
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(start, start + perPage);
  }, [filteredItems, start, perPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    // Only reset if page is not 1 and filters change
    if (page !== 1) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('page', '1');
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, searchTerm, selectedTag]);

  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }
    setInitialized(true);
  }, [searchParams, setSelectedTags]);

  if (!initialized) return null;

  if (layoutHome === LayoutHome.HOME_ONE) {
    return (
      <div className="pb-12 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-12 max-w-7xl mx-auto">
          <div className="lg:sticky lg:top-4 lg:self-start lg:w-80 lg:flex-shrink-0">
            <Categories total={props.total} categories={sortedCategories} />
          </div>
          <div className="w-full">
            <Tags 
              tags={sortedTags} 
              enableSticky={true} 
              maxVisibleTags={5} 
              total={props.total}
              mode={tagsMode}
            />
            <ListingClient {...props} items={paginatedItems} total={filteredItems.length} start={start} page={page} filteredCount={filteredItems.length} totalCount={props.items.length} />
            <div className="flex items-center justify-center mt-8">
              <Paginate
                basePath={props.basePath}
                initialPage={page}
                total={Math.ceil(filteredItems.length / perPage)}
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
      filteredAndSortedItems={filteredItems}
      paginatedItems={paginatedItems}
    />
  );
}
