"use client";

import { useMemo, useCallback, useContext } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter } from "lucide-react";

import Item from "@/components/item";
import { Link } from "@/i18n/navigation";
import { getItemPath } from "@/lib/utils";
import { PER_PAGE } from "@/lib/paginate";
import { layoutComponents, LayoutKey } from "@/components/layouts";
import { Category, ItemData, Tag } from "@/lib/content";
import ViewToggle from "@/components/view-toggle";
import { useLayoutTheme } from "@/components/context";
import { FilterContext } from "@/components/filters";

interface BaseCardProps {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
}

interface CardConfigOptions {
  showStats?: boolean;
  showViewToggle?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showEmptyState?: boolean;
  enableSearch?: boolean;
  enableTagFilter?: boolean;
  enableSorting?: boolean;
  customEmptyMessage?: string;
  customEmptyDescription?: string;
  animationDelay?: number;
  perPage?: number;
  defaultLayout?: LayoutKey;
}

interface ExtendedCardProps extends BaseCardProps {
  config?: CardConfigOptions;
  className?: string;
  onItemClick?: (item: ItemData) => void;
  renderCustomItem?: (item: ItemData, index: number) => React.ReactNode;
  renderCustomEmpty?: () => React.ReactNode;
  headerActions?: React.ReactNode;
}

interface FilterState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

interface ProcessedItems {
  filtered: ItemData[];
  paginated: ItemData[];
  hasActiveFilters: boolean;
}

// Constants
const SORT_OPTIONS = {
  POPULARITY: "popularity",
  NAME_ASC: "name-asc",
  NAME_DESC: "name-desc",
  DATE_DESC: "date-desc",
  DATE_ASC: "date-asc",
} as const;

const DEFAULT_CONFIG: CardConfigOptions = {
  showStats: true,
  showViewToggle: true,
  showFilters: true,
  showPagination: true,
  showEmptyState: true,
  enableSearch: true,
  enableTagFilter: true,
  enableSorting: true,
  animationDelay: 100,
  perPage: PER_PAGE,
  defaultLayout: "classic",
};

// Utility functions
const getTagId = (tag: string | Tag): string =>
  typeof tag === "string" ? tag : tag.id;

const getTagName = (tagId: string, tags: Tag[]): string | null =>
  tags.find((tag) => tag.id === tagId)?.name || null;

// Custom hooks
function useFilters(): FilterState {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }

  return context;
}

function useItemFiltering(
  items: ItemData[],
  searchTerm: string,
  selectedTags: string[],
  config: CardConfigOptions
): ItemData[] {
  const enableSearch = config.enableSearch ?? true;
  const enableTagFilter = config.enableTagFilter ?? true;

  return useMemo(() => {
    let filtered = items;

    if (enableSearch && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }

    if (enableTagFilter && selectedTags.length > 0) {
      filtered = filtered.filter((item) => {
        if (!item.tags?.length) return false;
        return selectedTags.some((selectedTagId) =>
          item.tags.some((itemTag) => getTagId(itemTag) === selectedTagId)
        );
      });
    }

    return filtered;
  }, [items, searchTerm, selectedTags, enableSearch, enableTagFilter]);
}

function useItemSorting(
  items: ItemData[],
  sortBy: string,
  config: CardConfigOptions
): ItemData[] {
  const enableSorting = config.enableSorting ?? true;

  return useMemo(() => {
    if (!enableSorting) return items;

    const sorted = [...items].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.NAME_ASC:
          return a.name.localeCompare(b.name);
        case SORT_OPTIONS.NAME_DESC:
          return b.name.localeCompare(a.name);
        case SORT_OPTIONS.DATE_DESC:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case SORT_OPTIONS.DATE_ASC:
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case SORT_OPTIONS.POPULARITY:
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    return sorted;
  }, [items, sortBy, enableSorting]);
}

function useProcessedItems(
  items: ItemData[],
  searchTerm: string,
  selectedTags: string[],
  sortBy: string,
  start: number,
  config: CardConfigOptions
): ProcessedItems {
  const filteredItems = useItemFiltering(
    items,
    searchTerm,
    selectedTags,
    config
  );
  const sortedItems = useItemSorting(filteredItems, sortBy, config);

  const showPagination = config.showPagination ?? true;
  const perPage = config.perPage || PER_PAGE;

  const paginatedItems = useMemo(() => {
    if (!showPagination) return sortedItems;
    return sortedItems.slice(start, start + perPage);
  }, [sortedItems, start, showPagination, perPage]);

  const enableSearch = config.enableSearch ?? true;
  const enableTagFilter = config.enableTagFilter ?? true;
  const enableSorting = config.enableSorting ?? true;

  const hasActiveFilters = useMemo(() => {
    const hasSearch = Boolean(enableSearch && searchTerm.trim() !== "");
    const hasTags = Boolean(enableTagFilter && selectedTags.length > 0);
    const hasSort = Boolean(
      enableSorting && sortBy !== SORT_OPTIONS.POPULARITY
    );
    return hasSearch || hasTags || hasSort;
  }, [
    searchTerm,
    selectedTags,
    sortBy,
    enableSearch,
    enableTagFilter,
    enableSorting,
  ]);

  return {
    filtered: sortedItems,
    paginated: paginatedItems,
    hasActiveFilters,
  };
}

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
  const tCommon = useTranslations("common");
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
        <span className="font-medium text-gray-900 dark:text-white">
          {filteredCount}
        </span>{" "}
        {tCommon("OF")}{" "}
        <span className="font-medium text-gray-900 dark:text-white">
          {totalCount}
        </span>{" "}
        {tCommon("ITEMS")}
        {hasActiveFilters && (
          <span className="text-primary-600 dark:text-primary-400">
            {" "}
            {t("FILTERED")}
          </span>
        )}
      </div>

      {(searchTerm || selectedTags.length > 0) && (
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3 h-3 text-blue-500 dark:text-blue-400" />
          <span className="text-blue-500 dark:text-blue-400 font-medium">
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
    <div className={`flex flex-col items-center gap-2 mt-4 ${className}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
        {t("ACTIVE_FILTERS")}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {searchTerm && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-200 dark:border-blue-700/50">
            {t("SEARCH_COLON")} &quot;{searchTerm}&quot;
          </span>
        )}
        {selectedTags.map((tagId: string) => {
          const tagName = getTagName(tagId, tags);
          return tagName ? (
            <span
              key={tagId}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-200 dark:border-blue-700/50"
            >
              {t("TAG_COLON")} {tagName}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
}

export function EmptyState({
  searchTerm,
  selectedTags,
  tags,
  t,
  customMessage,
  customDescription,
  className = "",
}: {
  searchTerm: string;
  selectedTags: string[];
  tags: Tag[];
  t: ReturnType<typeof useTranslations>;
  customMessage?: string;
  customDescription?: string;
  className?: string;
}) {
  const hasFilters = searchTerm || selectedTags.length > 0;

  return (
    <div className={`text-center py-8 sm:py-10 ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-colors duration-300">
        <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
        {customMessage || t("NO_ITEMS_FOUND")}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
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

export function ResultsHeader({
  searchTerm,
  selectedTags,
  sortBy,
  start,
  filteredCount,
  t,
  config,
  className = "",
}: {
  searchTerm: string;
  selectedTags: string[];
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
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
        {getHeaderTitle()}
      </h2>
      {config.showStats && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          <span>
            {t("SHOWING")} {start + 1}-
            {Math.min(start + pageSize, filteredCount)}
            {config.enableSorting && sortBy !== SORT_OPTIONS.POPULARITY && (
              <span className="ml-2 text-blue-500 dark:text-blue-400">
                {t("SORTED_BY")} {getSortLabel(sortBy)}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export function ItemsList({
  items,
  LayoutComponent,
  onItemClick,
  renderCustomItem,
  animationDelay = 100,
  className = "",
}: {
  items: ItemData[];
  LayoutComponent: React.ComponentType<{ children: React.ReactNode }>;
  onItemClick?: (item: ItemData) => void;
  renderCustomItem?: (item: ItemData, index: number) => React.ReactNode;
  animationDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <LayoutComponent>
        {items.map((item, index) => (
          <div
            key={item.slug}
            className="group animate-fadeInUp"
            style={{
              animationDelay: `${index * animationDelay}ms`,
              animationFillMode: "both",
            }}
          >
            {renderCustomItem ? (
              renderCustomItem(item, index)
            ) : (
              <Link
                className="block duration-300"
                prefetch={false}
                href={getItemPath(item.slug)}
                onClick={() => onItemClick?.(item)}
              >
                <Item {...item} isWrappedInLink={true} />
              </Link>
            )}
          </div>
        ))}
      </LayoutComponent>
    </div>
  );
}

/**
 * SharedCard - Reusable card component for displaying lists of items
 *
 * This component can be used throughout the application to display:
 * - Product lists
 * - Search results
 * - Item grids
 * - Content sections
 *
 * @example
 * // Basic usage
 * <SharedCard {...props} config={CardPresets.simple} />
 *
 * // Advanced usage
 * <SharedCard
 *   {...props}
 *   config={CardPresets.fullListing}
 *   onItemClick={(item) => console.log(item)}
 *   renderCustomItem={(item) => <CustomItem {...item} />}
 * />
 */
export function SharedCard(props: ExtendedCardProps) {
  const config = { ...DEFAULT_CONFIG, ...props.config };
  const { layoutKey, setLayoutKey } = useLayoutTheme();
  const { searchTerm, selectedTags, sortBy } = useFilters();
  const t = useTranslations("listing");

  const LayoutComponent = layoutComponents[layoutKey];

  const { filtered, paginated, hasActiveFilters } = useProcessedItems(
    props.items,
    searchTerm,
    selectedTags,
    sortBy,
    props.start,
    config
  );

  const handleViewChange = useCallback(
    (newView: LayoutKey) => setLayoutKey(newView),
    [setLayoutKey]
  );

  return (
    <div className={`w-full space-y-6 ${props.className || ""}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {config.showStats && (
            <FilterStats
              filteredCount={filtered.length}
              totalCount={props.items.length}
              searchTerm={searchTerm}
              selectedTags={selectedTags}
              hasActiveFilters={hasActiveFilters}
              t={t}
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          {props.headerActions}
          {config.showViewToggle && (
            <ViewToggle
              activeView={layoutKey}
              onViewChange={handleViewChange}
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {paginated.length === 0 ? (
          config.showEmptyState &&
          (props.renderCustomEmpty ? (
            props.renderCustomEmpty()
          ) : (
            <EmptyState
              searchTerm={searchTerm}
              selectedTags={selectedTags}
              tags={props.tags}
              t={t}
              customMessage={config.customEmptyMessage}
              customDescription={config.customEmptyDescription}
            />
          ))
        ) : (
          <div className="space-y-6">
            <ResultsHeader
              searchTerm={searchTerm}
              selectedTags={selectedTags}
              sortBy={sortBy}
              start={props.start}
              filteredCount={filtered.length}
              t={t}
              config={config}
            />
            <ItemsList
              items={paginated}
              LayoutComponent={LayoutComponent}
              onItemClick={props.onItemClick}
              renderCustomItem={props.renderCustomItem}
              animationDelay={config.animationDelay}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Alias for compatibility
export const Card = SharedCard;

export const CardPresets = {
  // Configuration for a complete listing page
  fullListing: {
    showStats: true,
    showViewToggle: true,
    showFilters: true,
    showPagination: true,
    showEmptyState: true,
    enableSearch: true,
    enableTagFilter: true,
    enableSorting: true,
  } as CardConfigOptions,
  showViewToggle: {
    showStats: true,
    showViewToggle: false,
    showFilters: true,
    showPagination: true,
    showEmptyState: true,
    enableSearch: true,
    enableTagFilter: true,
    enableSorting: true,
  } as CardConfigOptions,

  // Configuration for a simple section
  simple: {
    showStats: false,
    showViewToggle: false,
    showFilters: false,
    showPagination: false,
    showEmptyState: true,
    enableSearch: false,
    enableTagFilter: false,
    enableSorting: false,
  } as CardConfigOptions,

  // Configuration for a product grid
  productGrid: {
    showStats: true,
    showViewToggle: true,
    showFilters: true,
    showPagination: true,
    showEmptyState: true,
    enableSearch: true,
    enableTagFilter: true,
    enableSorting: true,
    defaultLayout: "grid" as LayoutKey,
  } as CardConfigOptions,

  // Configuration for search results
  searchResults: {
    showStats: true,
    showViewToggle: false,
    showFilters: true,
    showPagination: true,
    showEmptyState: true,
    enableSearch: true,
    enableTagFilter: true,
    enableSorting: true,
    customEmptyMessage: "No results found",
  } as CardConfigOptions,
};

// Simplified component for quick use cases
export function SimpleCard(
  props: BaseCardProps & { preset?: keyof typeof CardPresets }
) {
  const config = props.preset ? CardPresets[props.preset] : CardPresets.simple;
  return <Card {...props} config={config} />;
}

// Export types for reuse
export type { ExtendedCardProps, CardConfigOptions, BaseCardProps };
