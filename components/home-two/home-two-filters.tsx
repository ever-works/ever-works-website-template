"use client";

import { Category, Tag, ItemData } from "@/lib/content";
import { HomeTwoCategories, HomeTwoSortSelector, HomeTwoTagsSelector } from ".";
import ViewToggle from "@/components/view-toggle";
import { useFilters } from "@/hooks/use-filters";
import { SearchInput } from "../ui/search-input";

type Home2FiltersProps = {
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
  layoutKey: "classic" | "grid" | "cards";
  setLayoutKey: (layoutKey: "classic" | "grid" | "cards") => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  className?: string;
};

export function HomeTwoFilters({
  categories,
  tags,
  items,
  layoutKey,
  setLayoutKey,
}: Home2FiltersProps) {
  const { searchTerm, setSearchTerm } = useFilters();
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-3 items-center w-full">
        <div className="flex items-center justify-center gap-3">
          <HomeTwoSortSelector />
          <HomeTwoTagsSelector tags={tags} />
        </div>
        <div className="flex items-center justify-center gap-3 ">
          <div className="flex-1 md:flex-none w-full md:w-auto max-w-md">
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
      <HomeTwoCategories categories={categories} />
    </div>
  );
}
