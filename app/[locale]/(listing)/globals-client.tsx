"use client";
import { LayoutHome, useLayoutTheme } from "@/components/context";
import { Categories } from "@/components/filters/components/categories/categories-section";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { Tags } from "@/components/filters/components/tags/tags-section";
import { Tag, Category, ItemData } from "@/lib/content";
import { sortByNumericProperty, filterItems } from "@/lib/utils";
import { HomeTwoLayout } from "@/components/home-two";
import { ListingClient } from "@/components/shared-card/listing-client";
import { useFilters } from "@/hooks/use-filters";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PER_PAGE, totalPages } from "@/lib/paginate";

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
  const { layoutHome = LayoutHome.HOME_ONE, paginationType } = useLayoutTheme();
  const { selectedCategories, searchTerm, selectedTags, sortBy, setSelectedTags } = useFilters();
  const sortedTags = sortByNumericProperty(props.tags);
  const sortedCategories = sortByNumericProperty(props.categories);
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  // Get page from query param, default to 1
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const perPage = useLayoutTheme().itemsPerPage ?? 12;
  const start = (page - 1) * perPage;

  // Filtering logic using shared utility
  const filteredItems = useMemo(() => {
    return filterItems(props.items, {
      searchTerm,
      selectedTags,
      selectedCategories,
    });
  }, [props.items, searchTerm, selectedTags, selectedCategories]);

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
  }, [selectedTags, selectedCategories, searchTerm, searchParams, page]);

  // Client-side pagination state for Home 1
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort items for Home 1 using shared utility
  const filteredAndSortedItems = useMemo(() => {
    let filtered = filterItems(props.items, {
      selectedCategories,
      searchTerm,
      selectedTags,
    });

    // Sort items
    if (sortBy === "name-asc") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "date-desc") {
      filtered = [...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } else if (sortBy === "date-asc") {
      filtered = [...filtered].sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    }
    // Default is popularity (no sorting needed)

    return filtered;
  }, [props.items, selectedCategories, searchTerm, selectedTags, sortBy]);

  // Calculate paginated items for Home 1
  const homeOnePaginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    return filteredAndSortedItems.slice(start, end);
  }, [filteredAndSortedItems, currentPage]);

  // Calculate total pages for Home 1
  const totalPagesCount = useMemo(() => {
    return totalPages(filteredAndSortedItems.length);
  }, [filteredAndSortedItems.length]);

  // Handle page change for Home 1
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <div className="pb-12">
        <div className="flex flex-col md:flex-row w-full gap-5">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Categories total={props.total} categories={sortedCategories} tags={sortedTags} />
          </div>
          <div className="w-full flex-1">
            <Tags tags={sortedTags} enableSticky={true} maxVisibleTags={5} allItems={props.items} />
            <ListingClient 
              {...props}
              items={paginationType === "infinite" ? filteredAndSortedItems : homeOnePaginatedItems}
              filteredCount={filteredAndSortedItems.length}
              totalCount={props.items.length}
            />
            {paginationType === "standard" && totalPagesCount > 1 && (
              <div className="flex items-center justify-center">
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
