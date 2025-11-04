"use client";

import { Category, Tag } from "@/lib/content";
import { HomeTwoSortSelector, HomeTwoTagsSelector } from ".";
import { useFilters } from "@/hooks/use-filters";
import { SearchInput } from "../ui/search-input";
import { HomeTwoCategories } from "./home-two-categories";
import { LayoutKey } from "../layouts";
import { SortOption } from "../filters/types";
import { LayoutSettings } from "../layout-settings";
import clsx from "clsx";

const SORT_OPTIONS: SortOption[] = [
  'popularity',
  'name-asc',
  'name-desc',
  'date-desc',
  'date-asc',
];

// Style constants
const FILTERS_CONTAINER = "space-y-3 sm:space-y-4";
const MOBILE_FILTERS = "block sm:hidden space-y-3";
const TABLET_FILTERS = "hidden sm:block md:hidden";
const DESKTOP_FILTERS = "hidden md:flex justify-between items-center gap-4";
const FILTERS_GROUP = "flex items-center gap-3";

type Home2FiltersProps = {
  categories: Category[];
  tags: Tag[];
  layoutKey: LayoutKey;
  setLayoutKey: (layoutKey: LayoutKey) => void;
  onFilterChange?: () => void;
};

export function HomeTwoFilters({
  categories,
  tags,
  onFilterChange,
}: Home2FiltersProps) {
  const { 
    searchTerm, 
    setSearchTerm, 
    setSortBy, 
    sortBy,
    selectedCategories,
    toggleSelectedCategory,
    clearSelectedCategories
  } = useFilters();

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === "clear-all") {
      clearSelectedCategories();
    } else {
      toggleSelectedCategory(categoryId);
    }
    onFilterChange?.();
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onFilterChange?.();
  };

  const handleSortChange = (sort: string) => {
    if (SORT_OPTIONS.includes(sort as SortOption)) {
      setSortBy(sort as SortOption);
      onFilterChange?.();
    }
  };

  return (
    <div className={FILTERS_CONTAINER}>
      {/* Mobile Layout */}
      <div className={MOBILE_FILTERS}>
        <div className="w-full">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <HomeTwoSortSelector setSortBy={handleSortChange} sortBy={sortBy} />
            <HomeTwoTagsSelector tags={tags} />
          </div>
          <LayoutSettings />
        </div>
      </div>

      {/* Tablet Layout */}
      <div className={TABLET_FILTERS}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className={FILTERS_GROUP}>
              <HomeTwoSortSelector setSortBy={handleSortChange} sortBy={sortBy} />
              <HomeTwoTagsSelector tags={tags} />
            </div>
            <LayoutSettings />
          </div>

          <div className="w-full">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={DESKTOP_FILTERS}>
        {/* Left Side: Sort and Tags */}
        <div className={FILTERS_GROUP}>
          <HomeTwoSortSelector setSortBy={handleSortChange} sortBy={sortBy} />
          <HomeTwoTagsSelector tags={tags} />
        </div>

        {/* Right Side: Search and Layout */}
        <div className={FILTERS_GROUP}>
          <div className="w-64 lg:w-80 xl:w-96">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
            />
          </div>
          <LayoutSettings />
        </div>
      </div>

      <HomeTwoCategories 
        categories={categories}
        mode="filter"
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        totalItems={categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
      />
    </div>
  );
}


