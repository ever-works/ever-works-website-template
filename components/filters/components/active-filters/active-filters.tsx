import { Button } from "@heroui/react";
import { X } from "lucide-react";
import { ActiveFiltersProps, TagId } from "../../types";
import { containerStyles, textStyles } from "../../utils/style-utils";

/**
 * Active filters component
 * Displays and manages active search, tags, and sort filters
 */
export function ActiveFilters({
  searchTerm,
  setSearchTerm,
  selectedTags,
  setSelectedTags,
  selectedCategories,
  setSelectedCategories,
  sortBy,
  setSortBy,
  availableTags,
  availableCategories,
  clearAllFilters,
}: ActiveFiltersProps) {
  const hasActiveFilters = searchTerm || selectedTags.length > 0 || selectedCategories.length > 0 || sortBy !== "popularity";

  if (!hasActiveFilters) {
    return null;
  }

  const removeSelectedTag = (tagId: TagId) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId));
  };

  const removeSelectedCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
  };

  return (
    <div className={containerStyles.base}>
      <div className={containerStyles.header}>
        <div className="flex items-center justify-between">
          <h2 className={textStyles.title}>
            Active Filters
          </h2>
          <Button
            size="sm"
            variant="ghost"
            color="danger"
            onPress={clearAllFilters}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Clear All
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {searchTerm && (
          <div className="flex items-center gap-2">
            <span className={textStyles.label}>
              Search:
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-theme-primary-100 dark:bg-gray-800 text-theme-primary-700 dark:text-theme-primary-400 text-sm font-medium border border-theme-primary-200 dark:border-gray-700">
              {searchTerm}
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 text-theme-primary-600/70 dark:text-theme-primary-400/70 hover:text-theme-primary-800 dark:hover:text-theme-primary-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <span className={textStyles.label}>
              Selected Tags:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagId) => {
                const tag = availableTags.find((t) => t.id === tagId);
                return tag ? (
                  <span
                    key={tagId}
                    className="inline-flex items-center px-3 py-1 rounded-lg bg-theme-primary-100 dark:bg-gray-800 text-theme-primary-700 dark:text-theme-primary-400 text-sm font-medium border border-theme-primary-200 dark:border-gray-700"
                  >
                    {tag.name}
                    <button
                      onClick={() => removeSelectedTag(tagId)}
                      className="ml-2 text-theme-primary-600/70 dark:text-theme-primary-400/70 hover:text-theme-primary-800 dark:hover:text-theme-primary-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {selectedCategories.length > 0 && (
          <div className="space-y-2">
            <span className={textStyles.label}>
              Selected Categories:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((categoryId) => {
                const category = availableCategories.find((c) => c.id === categoryId);
                return category ? (
                  <span
                    key={categoryId}
                    className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-gray-700"
                  >
                    {category.name}
                    <button
                      onClick={() => removeSelectedCategory(categoryId)}
                      className="ml-2 text-blue-600/70 dark:text-blue-400/70 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {sortBy !== "popularity" && (
          <div className="flex items-center gap-2">
            <span className={textStyles.label}>
              Sort:
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 dark:bg-gray-800 text-green-700 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-gray-700">
              {sortBy === "name-asc"
                ? "Name (A-Z)"
                : sortBy === "name-desc"
                  ? "Name (Z-A)"
                  : sortBy === "date-desc"
                    ? "Newest"
                    : sortBy === "date-asc"
                      ? "Oldest"
                      : "Popularity"}
              <button
                onClick={() => setSortBy("popularity")}
                className="ml-2 text-green-600/70 dark:text-green-400/70 hover:text-green-800 dark:hover:text-green-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 