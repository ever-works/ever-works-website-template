"use client";
import { useTranslations } from "next-intl";
import { useFilters } from "@/hooks/use-filters";

export function HomeTwoSortSelector() {
  const t = useTranslations();
  const { sortBy, setSortBy } = useFilters();
  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 transition-colors duration-300"
    >
      <option value="popularity">Popularity</option>
      <option value="name-asc">{t("listing.NAME_A_Z")}</option>
      <option value="name-desc">{t("listing.NAME_Z_A")}</option>
      <option value="date-desc">{t("listing.NEWEST")}</option>
      <option value="date-asc">{t("listing.OLDEST")}</option>
    </select>
  );
}
