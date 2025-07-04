"use client";

import { Category, Tag, ItemData } from "@/lib/content";
import { HomeTwoSortSelector, HomeTwoTagsSelector } from ".";
import ViewToggle from "@/components/view-toggle";
import { useFilters } from "@/hooks/use-filters";
import { SearchInput } from "../ui/search-input";
import { Categories } from "./home-two-categories";
import { LayoutKey } from "../layouts";

type Home2FiltersProps = {
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
  layoutKey: LayoutKey;
  setLayoutKey: (layoutKey: LayoutKey) => void;
  className?: string;
};

export function HomeTwoFilters({
  categories,
  tags,
  layoutKey,
  setLayoutKey,
}: Home2FiltersProps) {
  const { searchTerm, setSearchTerm, setSortBy, sortBy } = useFilters();
  
  return (
    <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
      <div className="block sm:hidden space-y-3">
        <div className="w-full">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <HomeTwoSortSelector setSortBy={setSortBy} sortBy={sortBy} />
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
              <HomeTwoSortSelector setSortBy={setSortBy} sortBy={sortBy} />
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
              setSearchTerm={setSearchTerm}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:flex justify-between items-center gap-4">
        {/* Left Side: Sort and Tags */}
        <div className="flex items-center gap-3">
          <HomeTwoSortSelector setSortBy={setSortBy} sortBy={sortBy} />
          <HomeTwoTagsSelector tags={tags} />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-64 lg:w-80 xl:w-96">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          <ViewToggle
            activeView={layoutKey}
            onViewChange={(newView) => setLayoutKey(newView)}
          />
        </div>
      </div>

      <Categories categories={categories} tags={tags} maxVisibleTags={4} />
    </div>
  );
}
