import { Accordion, AccordionItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { CategoriesProps } from "../../types";
import { CategoriesList } from "./categories-list";
import { SearchInput } from "../../../ui/search-input";
import { useFilters } from "../../context/filter-context";
import { containerStyles, textStyles } from "../../utils/style-utils";
import { SortControl } from "../controls/sort-control";

/**
 * Main categories section component
 * Handles both mobile and desktop layouts for categories
 */
export function Categories({ total, categories }: CategoriesProps) {
  const t = useTranslations("listing");
  const { searchTerm, setSearchTerm, sortBy, setSortBy } = useFilters();

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <Accordion
          variant="bordered"
          className="shadow-sm bg-white dark:bg-gray-900/90 border border-gray-100 dark:border-gray-700 rounded-xl transition-colors duration-300"
        >
          <AccordionItem
            key="1"
            aria-label="Category"
            title={
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                  {t("CATEGORIES")}
                </span>
                <span className="bg-theme-primary-100 dark:bg-gray-800 text-theme-primary-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold border border-theme-primary-200 dark:border-gray-700/50">
                  {total}
                </span>
              </div>
            }
          >
            <div className="px-2 pb-2">
              <CategoriesList categories={categories} />
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col w-full max-w-64 gap-6">
        {/* Search Bar */}
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {/* Categories Section */}
        <div className={containerStyles.base}>
          <div className={containerStyles.header}>
            <h2 className={textStyles.title}>
              {t("CATEGORIES")}
            </h2>
          </div>
          <div className={containerStyles.content}>
            <CategoriesList categories={categories} />
          </div>
        </div>

        {/* Sort By Section (styled card, now outside categories) */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
          <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700/50">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300 capitalize">
              {t("SORT_BY")}
            </h2>
          </div>
          <div className="p-3 lg:p-4">
            <SortControl sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>
      </div>
    </>
  );
} 