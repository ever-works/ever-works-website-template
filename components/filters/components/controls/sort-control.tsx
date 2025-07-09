import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { SORT_OPTIONS, SORT_LABELS } from "../../constants";
import { SortOption } from "../../types";

interface SortControlProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  className?: string;
}

/**
 * Sort control component
 * Handles sorting options selection
 */
export function SortControl({ sortBy, setSortBy, className = "" }: SortControlProps) {
  const t = useTranslations("listing");

  return (
    <div className={`relative ${className}`}>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary-500 dark:focus:ring-theme-primary-400 focus:border-transparent appearance-none cursor-pointer transition-colors duration-300"
      >
        <option value={SORT_OPTIONS.POPULARITY}>{t(SORT_LABELS[SORT_OPTIONS.POPULARITY])}</option>
        <option value={SORT_OPTIONS.NAME_ASC}>{t(SORT_LABELS[SORT_OPTIONS.NAME_ASC])}</option>
        <option value={SORT_OPTIONS.NAME_DESC}>{t(SORT_LABELS[SORT_OPTIONS.NAME_DESC])}</option>
        <option value={SORT_OPTIONS.DATE_DESC}>{t(SORT_LABELS[SORT_OPTIONS.DATE_DESC])}</option>
        <option value={SORT_OPTIONS.DATE_ASC}>{t(SORT_LABELS[SORT_OPTIONS.DATE_ASC])}</option>
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
  );
} 