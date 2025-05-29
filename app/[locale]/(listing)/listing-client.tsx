"use client";

import Item from "@/components/item";
import { Link } from "@/i18n/navigation";
import { getItemPath } from "@/lib/utils";
import { PER_PAGE } from "@/lib/paginate";
import { layoutComponents } from "@/components/layouts";
import { Category, ItemData, Tag } from "@/lib/content";
import ViewToggle from "@/components/ViewToggle";
import { useLayoutTheme } from "@/components/context";
import { useState, useEffect, useMemo, useContext } from "react";
import { Search, Filter } from "lucide-react";
import { useTranslations } from "next-intl";

// Import FilterContext from filters.tsx
import { FilterContext } from "@/components/filters";

function useFilters() {
  // Always call hooks first
  const [fallbackSearchTerm, setFallbackSearchTerm] = useState("");
  const [fallbackSelectedTags, setFallbackSelectedTags] = useState<string[]>([]);
  const [fallbackSortBy, setFallbackSortBy] = useState("popularity");
  
  const context = useContext(FilterContext);
  
  if (!context) {
    // Return fallback values
    return {
      searchTerm: fallbackSearchTerm, 
      setSearchTerm: setFallbackSearchTerm,
      selectedTags: fallbackSelectedTags, 
      setSelectedTags: setFallbackSelectedTags,
      sortBy: fallbackSortBy, 
      setSortBy: setFallbackSortBy
    };
  }
  return context;
}

type ListingClientProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

// Helper function to get tag id from Tag object or string
function getTagId(tag: string | Tag): string {
  return typeof tag === 'string' ? tag : tag.id;
}

export function ListingClient(props: ListingClientProps) {
  const { layoutKey, setLayoutKey } = useLayoutTheme();
  const LayoutComponent = layoutComponents[layoutKey];
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { searchTerm, selectedTags, sortBy } = useFilters();
  const t = useTranslations("listing");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and sort items based on filters
  const filteredAndSortedItems = useMemo(() => {
    let filtered = props.items;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.tags || !Array.isArray(item.tags)) return false;
        
        return selectedTags.some((selectedTagId: string) => 
          item.tags.some(itemTag => getTagId(itemTag) === selectedTagId)
        );
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-desc":
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case "date-asc":
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case "popularity":
        default:
          // Featured items first, then by date
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    return sorted;
  }, [props.items, searchTerm, selectedTags, sortBy]);

  // Paginate the filtered results
  const paginatedItems = filteredAndSortedItems.slice(props.start, props.start + PER_PAGE);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedTags, sortBy]);

  if (!mounted) {
    return (
      <div className="w-full space-y-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Controls and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Filter Stats */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <span className="font-medium text-gray-900 dark:text-white">
              {filteredAndSortedItems.length}
            </span> {t("OF")} <span className="font-medium text-gray-900 dark:text-white">
              {props.items.length}
            </span> {t("ITEMS")}
            {(searchTerm || selectedTags.length > 0 || sortBy !== "popularity") && (
              <span className="ml-2 text-blue-500 dark:text-blue-400 font-medium">
                {t("FILTERED")}
              </span>
            )}
          </div>
          
          {/* Active filters indicator */}
          {(searchTerm || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              <span className="text-blue-500 dark:text-blue-400 font-medium">
                {searchTerm && t("SEARCH")} 
                {searchTerm && selectedTags.length > 0 && " + "}
                {selectedTags.length > 0 && `${selectedTags.length} ${selectedTags.length > 1 ? t("TAG_PLURAL") : t("TAG")}`}
              </span>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <ViewToggle
          activeView={layoutKey}
          onViewChange={(newView) => setLayoutKey(newView)}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <div className="animate-spin h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent rounded-full"></div>
            <span>{t("FILTERING_ITEMS")}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        {paginatedItems.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-colors duration-300">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {t("NO_ITEMS_FOUND")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
              {searchTerm || selectedTags.length > 0 
                ? t("TRY_ADJUSTING_FILTERS") 
                : t("NO_ITEMS_IN_CATEGORY")}
            </p>
            {(searchTerm || selectedTags.length > 0) && (
              <div className="flex flex-col items-center gap-2 mt-4">
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
                    const tag = props.tags.find(t => t.id === tagId);
                    return tag ? (
                      <span key={tagId} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-200 dark:border-blue-700/50">
                        {t("TAG_COLON")} {tag.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        ) : !isLoading ? (
          <div className="space-y-6">
            {/* Layout Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                {searchTerm ? t("SEARCH_RESULTS") : 
                 selectedTags.length > 0 ? t("TAGGED_ITEMS") : 
                 t("FEATURED_ITEMS")}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                <span>
                  {t("SHOWING")} {props.start + 1}-{Math.min(props.start + PER_PAGE, filteredAndSortedItems.length)} 
                  {sortBy !== "popularity" && (
                    <span className="ml-2 text-blue-500 dark:text-blue-400">
                      {t("SORTED_BY")} {
                        sortBy === "name-asc" ? t("NAME_A_Z") : 
                        sortBy === "name-desc" ? t("NAME_Z_A") :
                        sortBy === "date-desc" ? t("NEWEST") :
                        sortBy === "date-asc" ? t("OLDEST") : t("POPULARITY")
                      })
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Items Grid with Animation */}
            <div>
              <LayoutComponent>
                {paginatedItems.map((item, index) => (
                  <div
                    key={item.slug}
                    className="group animate-fadeInUp"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Link
                      className="block duration-300"
                      prefetch={false}
                      href={getItemPath(item.slug)}
                    >
                        <Item {...item} isWrappedInLink={true} />
                    </Link>
                  </div>
                ))}
              </LayoutComponent>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 