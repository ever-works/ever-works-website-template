"use client";
import { LayoutHome, useLayoutTheme } from "@/components/context";
import { Categories } from "@/components/filters/components/categories/categories-section";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { Tags } from "@/components/filters/components/tags/tags-section";
import { Tag, Category, ItemData } from "@/lib/content";
import { sortByNumericProperty } from "@/lib/utils";
import { totalPages, PER_PAGE } from "@/lib/paginate";
import { HomeTwoLayout, useHomeTwoLogic } from "@/components/home-two";
import { ListingClient } from "@/components/shared-card/listing-client";
import { useFilters } from "@/hooks/use-filters";
import { useState, useMemo } from "react";

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
  const { selectedCategories, searchTerm, selectedTags, sortBy } = useFilters();
  const homeTwoLogic = useHomeTwoLogic({ ...props, selectedCategories });
  const sortedTags = sortByNumericProperty(props.tags);
  const sortedCategories = sortByNumericProperty(props.categories);

  // Client-side pagination state for Home 1
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort items for Home 1
  const filteredAndSortedItems = useMemo(() => {
    let filtered = props.items;

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.category) return false;
        const itemCategories = Array.isArray(item.category) ? item.category : [item.category];
        return itemCategories.some(cat => {
          if (typeof cat === "string") return selectedCategories.includes(cat);
          if (typeof cat === "object" && cat && "id" in cat) return selectedCategories.includes(cat.id);
          return false;
        });
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.tags) return false;
        const itemTags = Array.isArray(item.tags) ? item.tags : [item.tags];
        return itemTags.some(tag => {
          const tagId = typeof tag === "string" ? tag : tag.id;
          return selectedTags.includes(tagId);
        });
      });
    }

    // Sort items
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    }
    // Default is popularity (no sorting needed)

    return filtered;
  }, [props.items, selectedCategories, searchTerm, selectedTags, sortBy]);

  // Calculate paginated items for Home 1
  const paginatedItems = useMemo(() => {
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

  if (layoutHome === LayoutHome.HOME_ONE) {
    return (
      <div className="pb-12">
        <div className="flex flex-col md:flex-row w-full gap-5">
          <div className="md:sticky md:top-4 md:self-start">
            <Categories total={props.total} categories={sortedCategories} />
          </div>
          <div className="w-full">
            <Tags tags={sortedTags} enableSticky={true} maxVisibleTags={5} total={props.total} />
            <ListingClient 
              {...props}
              items={paginatedItems}
              filteredCount={filteredAndSortedItems.length}
              totalCount={props.items.length}
            />
            {totalPagesCount > 1 && (
              <div className="flex items-center justify-center">
                <Paginate
                  basePath={props.basePath}
                  initialPage={currentPage}
                  total={totalPagesCount}
                  onPageChange={handlePageChange}
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
      filteredAndSortedItems={homeTwoLogic.items}
      paginatedItems={homeTwoLogic.paginatedItems}
    />
  );
}
