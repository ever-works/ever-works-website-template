"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Filter, Search } from "lucide-react";
import { clsx } from "clsx";
import type { Tag } from "@/lib/content";
import type { SortOption } from "@/components/filters/types";
import { PER_PAGE } from "@/lib/paginate";
import { SORT_OPTIONS } from "./utils/sort-utils";
import { getTagName } from "./utils/filter-utils";
import type { CardConfigOptions } from "./index";
import ViewToggle from "../view-toggle";
import type { LayoutKey } from "@/components/layouts";

interface SharedCardHeaderProps {
  searchTerm: string;
  selectedTags: string[];
  selectedTag: string | null;
  sortBy: SortOption;
  filteredCount: number;
  totalCount: number;
  isInfinite: boolean;
  start: number;
  hasActiveFilters: boolean;
  config: CardConfigOptions;
  tags: Tag[];
  headerActions?: React.ReactNode;
  layoutKey?: LayoutKey;
  onViewChange?: (view: LayoutKey) => void;
}

const filterStatsClasses = "flex items-center gap-4";
const filterTextClasses = "text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300";
const filterBadgeClasses = "flex items-center gap-2 text-xs";
const filterIconClasses = "w-3 h-3 text-theme-primary-500 dark:text-theme-primary-400";
const filterLabelClasses = "text-theme-primary-500 dark:text-theme-primary-400 font-medium";
const headerTitleClasses = "text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300";
const headerStatsClasses = "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300";
const sortLabelClasses = "ml-2 text-theme-primary-500 dark:text-theme-primary-400";
const activeFilterBadgeClasses = "px-2 py-1 bg-theme-primary-10 dark:bg-theme-primary-900/30 text-white rounded text-xs";
const emptyStateContainerClasses = "text-center py-8 sm:py-10";
const emptyStateIconWrapperClasses = "w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-colors duration-300";
const emptyStateIconClasses = "w-8 h-8 text-gray-400 dark:text-gray-500";
const emptyStateTitleClasses = "text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300";
const emptyStateDescriptionClasses = "text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300";

/**
 * FilterStats - Display filter statistics
 */
export function FilterStats({
  filteredCount,
  totalCount,
  searchTerm,
  selectedTags,
  hasActiveFilters,
  t,
  className = "",
}: {
  filteredCount: number;
  totalCount: number;
  searchTerm: string;
  selectedTags: string[];
  hasActiveFilters: boolean;
  t: ReturnType<typeof useTranslations>;
  className?: string;
}) {
  return (
    <div className={clsx(filterStatsClasses, className)}>
      <div className={filterTextClasses}>
        {hasActiveFilters
          ? t("FILTER_STATUS_MATCH_ALL", { filtered: filteredCount, total: totalCount })
          : t("FILTER_STATUS", { filtered: filteredCount, total: totalCount })}
      </div>

      {(searchTerm || selectedTags.length > 0) && (
        <div className={filterBadgeClasses}>
          <Filter className={filterIconClasses} />
          <span className={filterLabelClasses}>
            {searchTerm && t("SEARCH")}
            {searchTerm && selectedTags.length > 0 && " + "}
            {selectedTags.length > 0 &&
              `${selectedTags.length} ${
                selectedTags.length > 1 ? t("TAG_PLURAL") : t("TAG")
              }`}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * ActiveFiltersDisplay - Display active filters as badges
 */
export function ActiveFiltersDisplay({
  searchTerm,
  selectedTags,
  tags,
  t,
  className = "",
}: {
  searchTerm: string;
  selectedTags: string[];
  tags: Tag[];
  t: ReturnType<typeof useTranslations>;
  className?: string;
}) {
  if (!searchTerm && selectedTags.length === 0) return null;

  return (
    <div className={clsx("flex flex-col items-center gap-2 mt-4", className)}>
      <p className={filterTextClasses}>
        {t("ACTIVE_FILTERS")}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {searchTerm && (
          <span className={activeFilterBadgeClasses}>
            {t("SEARCH_COLON")} &quot;{searchTerm}&quot;
          </span>
        )}
        {selectedTags.map((tagId: string) => {
          const tagName = getTagName(tagId, tags);
          return tagName ? (
            <span
              key={tagId}
              className={activeFilterBadgeClasses}
            >
              {t("TAG_COLON")} {tagName}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
}

/**
 * EmptyState - Display when no items are found
 */
export function EmptyState({
  searchTerm,
  selectedTags,
  selectedTag,
  tags,
  t,
  customMessage,
  customDescription,
  className = "",
}: {
  searchTerm: string;
  selectedTags: string[];
  selectedTag: string | null;
  tags: Tag[];
  t: ReturnType<typeof useTranslations>;
  customMessage?: string;
  customDescription?: string;
  className?: string;
}) {
  const hasFilters = searchTerm || selectedTags.length > 0 || selectedTag;

  return (
    <div className={clsx(emptyStateContainerClasses, className)}>
      <div className={emptyStateIconWrapperClasses}>
        <Search className={emptyStateIconClasses} />
      </div>
      <h3 className={emptyStateTitleClasses}>
        {customMessage || t("NO_ITEMS_FOUND")}
      </h3>
      <p className={emptyStateDescriptionClasses}>
        {customDescription ||
          (hasFilters ? t("TRY_ADJUSTING_FILTERS") : t("NO_ITEMS_IN_CATEGORY"))}
      </p>
      <ActiveFiltersDisplay
        searchTerm={searchTerm}
        selectedTags={selectedTags}
        tags={tags}
        t={t}
      />
    </div>
  );
}

/**
 * ResultsHeader - Display results header with sorting info
 */
export function ResultsHeader({
  searchTerm,
  selectedTags,
  isInfinite = false,
  sortBy,
  start,
  filteredCount,
  t,
  config,
  className = "",
}: {
  searchTerm: string;
  selectedTags: string[];
  isInfinite?: boolean;
  sortBy: string;
  start: number;
  filteredCount: number;
  t: ReturnType<typeof useTranslations>;
  config: CardConfigOptions;
  className?: string;
}) {
  const getSortLabel = useCallback(
    (sortKey: string): string => {
      switch (sortKey) {
        case SORT_OPTIONS.NAME_ASC:
          return t("NAME_A_Z");
        case SORT_OPTIONS.NAME_DESC:
          return t("NAME_Z_A");
        case SORT_OPTIONS.DATE_DESC:
          return t("NEWEST");
        case SORT_OPTIONS.DATE_ASC:
          return t("OLDEST");
        default:
          return t("POPULARITY");
      }
    },
    [t]
  );

  const getHeaderTitle = useCallback((): string => {
    if (searchTerm) return t("SEARCH_RESULTS");
    if (selectedTags.length > 0) return t("TAGGED_ITEMS");
    return t("FEATURED_ITEMS");
  }, [searchTerm, selectedTags, t]);

  const pageSize = config.perPage || PER_PAGE;

  return (
    <div className={clsx("flex items-center justify-between", className)}>
      <h2 className={headerTitleClasses}>
        {getHeaderTitle()}
      </h2>
      {config.showStats && (
        <div className={headerStatsClasses}>
          <span>
            {t("SHOWING")} {start + 1}-
            {isInfinite
              ? filteredCount
              : Math.min(start + pageSize, filteredCount)
            }
            {config.enableSorting && sortBy !== SORT_OPTIONS.POPULARITY && (
              <span className={sortLabelClasses}>
                {t("SORTED_BY")} {getSortLabel(sortBy)}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * SharedCardHeader - Main header component orchestrating all header elements
 */
export function SharedCardHeader(props: SharedCardHeaderProps) {
  const { config, headerActions, layoutKey, onViewChange } = props;
  const t = useTranslations("listing");

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {config.showStats && (
            <FilterStats
              filteredCount={props.filteredCount}
              totalCount={props.totalCount}
              searchTerm={props.searchTerm}
              selectedTags={props.selectedTags}
              hasActiveFilters={props.hasActiveFilters}
              t={t}
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          {headerActions}
          {config.showViewToggle && layoutKey && onViewChange && (
            <ViewToggle
              activeView={layoutKey}
              onViewChange={onViewChange}
            />
          )}
        </div>
      </div>

      {config.showFilters && (
        <ResultsHeader
          searchTerm={props.searchTerm}
          selectedTags={props.selectedTags}
          isInfinite={props.isInfinite}
          sortBy={props.sortBy}
          start={props.start}
          filteredCount={props.filteredCount}
          t={t}
          config={config}
          className="mb-6"
        />
      )}
    </>
  );
}
