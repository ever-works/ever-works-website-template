"use client";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { SortOption } from "../filters/types";

interface ISortSelector {
  setSortBy?: (sort: SortOption) => void;
  sortBy?: SortOption;
  className?: string;
}

export function HomeTwoSortSelector({ sortBy, setSortBy, className }: ISortSelector) {
  const t = useTranslations();
  return (
    <div className={`relative inline-block ${className || ""}`}>
      <select
        
        value={sortBy}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSortBy && setSortBy(e.target.value as SortOption)
        }
        className="appearance-none bg-gray-100 dark:bg-gray-800 border-2 border-theme-primary-500/50 dark:border-theme-primary-500/50 rounded-lg px-2 sm:px-3 py-1.5 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-900 dark:text-white font-medium w-full min-w-[100px] sm:min-w-[120px] focus:outline-hidden focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-theme-primary-600 dark:hover:border-theme-primary-400"
        aria-label="Sort by"
      >
        <option value="popularity">{t("listing.POPULARITY")}</option>
        <option value="name-asc">{t("listing.NAME_A_Z")}</option>
        <option value="name-desc">{t("listing.NAME_Z_A")}</option>
        <option value="date-desc">{t("listing.NEWEST")}</option>
        <option value="date-asc">{t("listing.OLDEST")}</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-theme-primary-500" />
    </div>
  );
}
