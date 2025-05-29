"use client";

import { Category, Tag } from "@/lib/content";
import {
  Accordion,
  AccordionItem,
  Button,
  cn,
  Pagination,
  Input,
  Tooltip
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { PropsWithChildren, useState, createContext, useContext } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import Image from "next/image";

type FilterContextType = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
};

export const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");

  return (
    <FilterContext.Provider value={{
      searchTerm, setSearchTerm,
      selectedTags, setSelectedTags,
      sortBy, setSortBy
    }}>
      {children}
    </FilterContext.Provider>
  );
}

function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

function BlockLink({
  href,
  isActive,
  children,
}: PropsWithChildren<{ href: string; isActive: boolean }>) {
  return (
    <Button
      className={cn(
        "font-medium text-left justify-start items-center transition-all duration-200 mb-1",
        {
          "bg-blue-500 dark:bg-blue-600 text-white border border-blue-500 dark:border-blue-600": isActive,
          "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600": !isActive,
        }
      )}
      radius="lg"
      variant="light"
      as={Link}
      href={href}
      fullWidth
    >
      {children}
    </Button>
  );
}

export function CategoriesList({
  categories,
}: {
  categories: Category[];
}) {
  const t = useTranslations("listing");
  const pathname = usePathname();

  const totalItems = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-1">
      <Tooltip
        content={t("ALL_CATEGORIES")}
        placement="right"
        delay={300}
        closeDelay={100}
        classNames={{
          content: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium"
        }}
      >
        <div>
          <BlockLink
            isActive={pathname === "/" || pathname.startsWith("/discover")}
            href="/"
          >
            <div className="flex items-center justify-between w-full px-3 py-2">
              <span className="font-medium truncate pr-2">
                {t("ALL_CATEGORIES")}
              </span>
              <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full transition-colors duration-300 flex-shrink-0">
                {totalItems}
              </span>
            </div>
          </BlockLink>
        </div>
      </Tooltip>

      {categories.map((category) => {
        if (!category.count) return null;

        const href = `/categories/${category.id}`;
        const isActive = pathname.startsWith(encodeURI(href));
        const displayName = truncateText(category.name);
        const isTextTruncated = category.name.length > 20;

        return (
          <Tooltip
            key={category.id}
            content={isTextTruncated ? category.name : null}
            placement="right"
            delay={300}
            closeDelay={100}
            isDisabled={!isTextTruncated}
            classNames={{
              content: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium max-w-xs"
            }}
          >
            <div>
              <BlockLink isActive={isActive} href={href}>
                <div className="flex items-center justify-between w-full px-3 py-2">
                  <span className="font-medium truncate pr-2" title={isTextTruncated ? category.name : undefined}>
                    {displayName}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full transition-colors duration-300 flex-shrink-0",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  )}>
                    {category.count}
                  </span>
                </div>
              </BlockLink>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function Categories(props: { total: number; categories: Category[] }) {
  const t = useTranslations("listing");
  const { searchTerm, setSearchTerm, selectedTags, setSelectedTags, sortBy, setSortBy } = useFilters();

  const availableTags = props.categories.flatMap(cat => 
    Array.isArray(cat) ? cat : [cat]
  ).filter(Boolean);

  const removeSelectedTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSortBy("popularity");
  };

  return (
    <>
      <div className="md:hidden">
        <Accordion variant="bordered" className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors duration-300">
          <AccordionItem
            key="1"
            aria-label="Category"
            title={
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                  {t("CATEGORIES")}
                </span>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-700/50">
                  {props.total}
                </span>
              </div>
            }
          >
            <div className="px-2 pb-2">
              <CategoriesList {...props} />
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="hidden md:flex flex-col w-full max-w-64 gap-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-sm dark:shadow-lg transition-colors duration-300">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-12"
                classNames={{
                  input: "bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                  inputWrapper: "bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-600/50 hover:border-gray-400 dark:hover:border-gray-500 focus-within:border-blue-500 dark:focus-within:border-blue-400"
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              {t("CATEGORIES")}
            </h2>
          </div>
          <div className="p-2">
            <CategoriesList {...props} />
          </div>
        </div>

        {(searchTerm || selectedTags.length > 0 || sortBy !== "popularity") && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                Active Filters
              </h2>
              <Button
                size="sm"
                variant="ghost"
                color="danger"
                onPress={clearAllFilters}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                Clear All
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Search:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-700/50">
                    {searchTerm}
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="ml-2 text-blue-600/70 dark:text-blue-300/70 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
              
              {selectedTags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Selected Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tagId => {
                      const tag = availableTags.find(t => t.id === tagId);
                      return tag ? (
                        <span key={tagId} className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-700/50">
                          {tag.name}
                          <button 
                            onClick={() => removeSelectedTag(tagId)}
                            className="ml-2 text-blue-600/70 dark:text-blue-300/70 hover:text-blue-800 dark:hover:text-blue-100"
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">Sort:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium border border-green-200 dark:border-green-700/50">
                    {sortBy === "name-asc" ? "Name (A-Z)" : 
                     sortBy === "name-desc" ? "Name (Z-A)" :
                     sortBy === "date-desc" ? "Date (Newest)" :
                     sortBy === "date-asc" ? "Date (Oldest)" : "Popularity"}
                    <button 
                      onClick={() => setSortBy("popularity")}
                      className="ml-2 text-green-600/70 dark:text-green-300/70 hover:text-green-800 dark:hover:text-green-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sort By Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Sort By
            </h2>
          </div>
          <div className="p-4">
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none cursor-pointer transition-colors duration-300"
              >
                <option value="popularity">Popularity</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Paginate({
  basePath,
  initialPage,
  total,
}: {
  basePath: string;
  initialPage: number;
  total: number;
}) {
  const router = useRouter();

  function redirect(page: number) {
    const path = basePath + (page === 1 ? "" : `/${page}`);
    router.push(path);
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-16 mb-12">
      {/* Page info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page <span className="font-semibold text-primary-600 dark:text-primary-400">{initialPage}</span> of{" "}
          <span className="font-semibold text-primary-600 dark:text-primary-400">{total}</span>
        </p>
      </div>

      {/* Enhanced Pagination */}
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-600/5 to-primary-500/10 rounded-2xl blur-xl opacity-60"></div>
        
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-2 shadow-lg">
          <Pagination
            showControls
            total={total}
            initialPage={initialPage}
            onChange={redirect}
            radius="lg"
            size="lg"
            classNames={{
              wrapper: "gap-2 p-2",
              item: cn(
                "min-w-10 h-10 text-sm font-medium transition-all duration-300 ease-out",
                "bg-transparent hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100",
                "dark:hover:from-primary-900/30 dark:hover:to-primary-800/30",
                "text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300",
                "border border-transparent hover:border-primary-200 dark:hover:border-primary-700/50",
                "hover:shadow-md hover:scale-105 active:scale-95",
                "data-[hover=true]:bg-gradient-to-r data-[hover=true]:from-primary-50 data-[hover=true]:to-primary-100",
                "dark:data-[hover=true]:from-primary-900/30 dark:data-[hover=true]:to-primary-800/30"
              ),
              cursor: cn(
                "bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold",
                "shadow-lg shadow-primary-500/25 dark:shadow-primary-500/20",
                "border-2 border-primary-400 dark:border-primary-500",
                "hover:from-primary-600 hover:to-primary-700 hover:shadow-xl hover:shadow-primary-500/30",
                "hover:scale-110 active:scale-95 transition-all duration-300",
                "relative overflow-hidden"
              ),
              prev: cn(
                "min-w-12 h-10 font-medium transition-all duration-300",
                "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                "text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300",
                "border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600",
                "hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20",
                "hover:shadow-md hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              ),
              next: cn(
                "min-w-12 h-10 font-medium transition-all duration-300",
                "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                "text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300",
                "border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600",
                "hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20",
                "hover:shadow-md hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function Tags(props: { tags: Tag[] }) {
  const pathname = usePathname();
  const t = useTranslations();
  const [showAllTags, setShowAllTags] = useState(false);
  const { selectedTags, setSelectedTags } = useFilters();

  const MAX_VISIBLE_TAGS = 15;
  const hasMoreTags = props.tags.length > MAX_VISIBLE_TAGS;

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(
      selectedTags.includes(tagId)
        ? selectedTags.filter(id => id !== tagId)
        : [...selectedTags, tagId]
    );
  };

  const renderTag = (tag: Tag, index: number) => {
    const isActive = pathname.startsWith(encodeURI(`/tags/${tag.id}`));
    const isSelected = selectedTags.includes(tag.id);
    
    const truncateTagName = (name: string, maxLength: number = 15) => {
      if (name.length <= maxLength) return name;
      return name.substring(0, maxLength) + "...";
    };

    const displayName = truncateTagName(tag.name);
    const isTextTruncated = tag.name.length > 15;
    
    const tagButton = (
      <Button
        key={tag.id || index}
        variant={isActive || isSelected ? "solid" : "bordered"}
        radius="full"
        size="sm"
        onClick={() => handleTagToggle(tag.id)}
        className={cn(
          "px-3 py-1 h-8 font-medium transition-all duration-200 cursor-pointer",
          isActive || isSelected
            ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600 shadow-sm"
            : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
          "hover:shadow-md"
        )}
      >
        {(isActive || isSelected) && (
          <svg
            className="w-3 h-3 mr-1.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        
        {tag.icon_url && (
          <Image
            width={20}
            height={20}
            src={tag.icon_url}
            className={cn(
              "w-4 h-4 mr-1.5 transition-transform",
              (isActive || isSelected) ? "brightness-200" : ""
            )}
            alt={tag.name}
          />
        )}
        <span className="truncate">{displayName}</span>
        {tag.count && (
          <span
            className={cn(
              "ml-1.5 text-xs font-normal flex-shrink-0",
              (isActive || isSelected) ? "text-white" : "text-gray-500 dark:text-gray-400"
            )}
          >
            ({tag.count})
          </span>
        )}
      </Button>
    );

    return isTextTruncated ? (
      <Tooltip
        key={tag.id || index}
        content={tag.name}
        placement="top"
        delay={300}
        closeDelay={100}
        classNames={{
          content: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium max-w-xs"
        }}
      >
        {tagButton}
      </Tooltip>
    ) : tagButton;
  };

  const displayedTags = showAllTags ? props.tags : props.tags.slice(0, MAX_VISIBLE_TAGS);

  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">{t("listing.TAGS")}</h3>
        {hasMoreTags && (
          <Button
            variant="light"
            color="primary"
            size="sm"
            className="px-2 py-0 h-6 font-medium text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
            onPress={() => setShowAllTags(!showAllTags)}
          >
            {showAllTags ? t("common.SHOW_LESS") : t("common.SHOW_ALL")}
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="w-full flex gap-2 flex-wrap">
          {displayedTags.map(renderTag)}
        </div>
      </div>

      {hasMoreTags && (
        <div className="flex justify-center mt-3">
          <Button
            variant="flat"
            color="primary"
            radius="full"
            size="sm"
            className="px-4 py-1 font-medium shadow-sm group text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-300"
            onPress={() => setShowAllTags(!showAllTags)}
          >
            {showAllTags ? (
              <>
                <span>{t("common.SHOW_LESS")}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ml-1.5 transition-transform group-hover:-translate-y-0.5"
                >
                  <path
                    d="M18 15L12 9L6 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>{t("common.SHOW_ALL")} {props.tags.length} {t("listing.TAGS").toLowerCase()}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ml-1.5 transition-transform group-hover:translate-y-0.5"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
