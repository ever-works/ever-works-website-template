"use client";

import { Category, Tag, ItemData } from "@/lib/content";
import {
  HomeTwoCategories,
  HomeTwoSearchBar, HomeTwoSortSelector, HomeTwoTagsSelector
} from ".";
import ViewToggle from "@/components/ViewToggle";

type Home2FiltersProps = {
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
  layoutKey: "classic" | "grid" | "cards";
  setLayoutKey: (layoutKey: "classic" | "grid" | "cards") => void;
};

export function HomeTwoFilters(props: Home2FiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-3 items-center w-full">
        <div className="flex items-center justify-center gap-3">
          <HomeTwoSortSelector />
          <HomeTwoTagsSelector tags={props.tags} />
        </div>
        <div className="flex items-center justify-center gap-3 ">
          <div className="flex-1 md:flex-none w-full md:w-auto max-w-md">
            <HomeTwoSearchBar />
          </div>
          <ViewToggle
            activeView={props.layoutKey}
            onViewChange={(newView) => props.setLayoutKey(newView)}
          />
        </div>
      </div>
      <HomeTwoCategories categories={props.categories} />
    </div>
  );
}