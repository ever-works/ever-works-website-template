"use client";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

interface ISortSelector {
  setSortBy?: (sort: string) => void;
  sortBy?: string;
}

export function HomeTwoSortSelector({ sortBy, setSortBy }: ISortSelector) {
  const t = useTranslations();
  return (
    <div className="relative inline-block w-full max-w-xs">
      <select
        value={sortBy}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSortBy && setSortBy(e.target.value)
        }
        className="appearance-none bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 pr-10 text-sm text-blue-600 dark:text-blue-400 w-full"
      >
        <option value="popularity">{t("listing.POPULARITY")}</option>
        <option value="name-asc">{t("listing.NAME_A_Z")}</option>
        <option value="name-desc">{t("listing.NAME_Z_A")}</option>
        <option value="date-desc">{t("listing.NEWEST")}</option>
        <option value="date-asc">{t("listing.OLDEST")}</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
    </div>
  );
}
