"use client";

import { Category, Tag } from "@/lib/content";
import { HomeTwoSortSelector, HomeTwoTagsSelector } from ".";
import ViewToggle from "@/components/view-toggle";
import { useFilters } from "@/hooks/use-filters";
import { SearchInput } from "../ui/search-input";
import { HomeTwoCategories } from "./home-two-categories";
import { LayoutKey } from "../layouts";
import { SortOption } from "../filters/types";

const SORT_OPTIONS: SortOption[] = [
  'popularity',
  'name-asc',
  'name-desc',
  'date-desc',
  'date-asc',
];

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
  layoutKey,
  setLayoutKey,
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
    <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
      <div className="block sm:hidden space-y-3">
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
          <ViewToggle
            activeView={layoutKey}
            onViewChange={(newView) => setLayoutKey(newView)}
          />
        </div>
      </div>

      <div className="hidden sm:block md:hidden">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <HomeTwoSortSelector setSortBy={handleSortChange} sortBy={sortBy} />
              <HomeTwoTagsSelector tags={tags} />
            </div>
            <ViewToggle
              activeView={layoutKey}
              onViewChange={(newView) => setLayoutKey(newView)}
            />
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

      <div className="hidden md:flex justify-between items-center gap-4">
        {/* Left Side: Sort and Tags */}
        <div className="flex items-center gap-3">
          <HomeTwoSortSelector setSortBy={handleSortChange} sortBy={sortBy} />
          <HomeTwoTagsSelector tags={tags} />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-64 lg:w-80 xl:w-96">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
            />
          </div>
          <ViewToggle
            activeView={layoutKey}
            onViewChange={(newView) => setLayoutKey(newView)}
          />
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


