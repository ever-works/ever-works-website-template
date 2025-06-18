"use client";

import { Category, Tag } from "@/lib/content";
import {
  Accordion,
  AccordionItem,
  Button,
  cn,
  Pagination,
  Tooltip,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  PropsWithChildren,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import { X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { SearchInput } from "./ui/search-input";

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
    <FilterContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        selectedTags,
        setSelectedTags,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

interface BlockLinkProps
  extends PropsWithChildren<{ href: string; isActive: boolean }> {
  isAllCategories?: boolean;
}

function BlockLink({
  href,
  isActive,
  children,
  isAllCategories,
}: BlockLinkProps) {
  return (
    <Button
      className={cn(
        "font-medium text-left justify-start items-center transition-colors duration-300 mb-1 h-10 px-3",
        "hover:transform-none active:transform-none",
        {
          "bg-theme-primary-500 text-white": isActive,
          "bg-gray-800 text-white": !isActive && isAllCategories,
          "bg-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800":
            !isActive && !isAllCategories,
        }
      )}
      radius="md"
      variant="light"
      as={Link}
      href={href}
      fullWidth
    >
      {children}
    </Button>
  );
}

export function CategoriesList({ categories }: { categories: Category[] }) {
  const t = useTranslations("listing");
  const pathname = usePathname();

  const totalItems = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-1.5 max-h-lvh">
      <Tooltip
        content={t("ALL_CATEGORIES")}
        placement="right"
        delay={300}
        closeDelay={100}
        classNames={{
          content:
            "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2.5 py-1.5 rounded-md text-sm font-medium shadow-lg",
        }}
      >
        <div>
          <BlockLink isActive={pathname === "/categories"} href="/categories">
            <div className="flex items-center justify-between w-full group">
              <span className="font-medium truncate pr-2 text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                {t("ALL")}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300 flex-shrink-0 group-hover:scale-105",
                  pathname === "/categories"
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                {totalItems}
              </span>
            </div>
          </BlockLink>
        </div>
      </Tooltip>

      <div className="overflow-y-auto scrollbar-none max-h-[650px]">
        {categories.map((category) => {
          if (!category.count) return null;
          const href = `/categories/category/${category.id}`;
          const isActive = pathname.startsWith(encodeURI(href));
          const displayName = truncateText(category.name);
          const isTextTruncated = category.name.length > 20;

          return (
            <Tooltip
              key={category.id}
              content={displayName}
              placement="right"
              delay={300}
              closeDelay={100}
              isDisabled={!isTextTruncated}
              classNames={{
                content:
                  "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2.5 py-1.5 rounded-lg text-sm font-medium shadow-lg max-w-xs",
              }}
            >
              <div>
                <BlockLink isActive={isActive} href={href}>
                  <div className="flex items-center justify-between w-full group">
                    <span
                      className="font-medium truncate pr-2 text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 capitalize"
                      title={isTextTruncated ? category.name : undefined}
                    >
                      {displayName}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300 flex-shrink-0 group-hover:scale-105",
                        isActive
                          ? "text-white"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {category.count}
                    </span>
                  </div>
                </BlockLink>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export function Categories(props: { total: number; categories: Category[] }) {
  const t = useTranslations("listing");
  const {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
  } = useFilters();

  const availableTags = props.categories
    .flatMap((cat) => (Array.isArray(cat) ? cat : [cat]))
    .filter(Boolean);

  const removeSelectedTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSortBy("popularity");
  };

  return (
    <>
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
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {/* Categories Section */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300">
              {t("CATEGORIES")}
            </h2>
          </div>
          <div className="p-2">
            <CategoriesList {...props} />
          </div>
        </div>

        {/* Active Filters Section */}
        {(searchTerm || selectedTags.length > 0 || sortBy !== "popularity") && (
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300">
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
            <div className="p-4 space-y-3">
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Selected Tags:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = availableTags.find((t) => t.id === tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className="inline-flex items-center px-3 py-1  rounded-lg bg-theme-primary-100 dark:bg-gray-800 text-theme-primary-700 dark:text-theme-primary-400 text-sm font-medium border border-theme-primary-200 dark:border-gray-700"
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

              {sortBy !== "popularity" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
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
        )}

        {/* Sort By Section */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors duration-300">
              {t("CATEGORIES")}
            </h2>
          </div>
          <div className="p-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary-500 dark:focus:ring-theme-primary-400 focus:border-transparent appearance-none cursor-pointer transition-colors duration-300"
              >
                <option value="popularity">{t("POPULARITY")}</option>
                <option value="name-asc">{t("NAME_A_Z")}</option>
                <option value="name-desc">{t("NAME_Z_A")}</option>
                <option value="date-desc">{t("NEWEST")}</option>
                <option value="date-asc">{t("OLDEST")}</option>
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
  const { navigateWithScroll } = useScrollToTop({
    easing: "easeInOut",
    duration: 600,
    threshold: 100,
  });

  function redirect(page: number) {
    const path = basePath + (page === 1 ? "" : `/${page}`);
    navigateWithScroll(path, 800);
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-16 mb-12">
      {/* Page info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page{" "}
          <span className="font-semibold text-theme-primary dark:text-theme-primary">
            {initialPage}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-theme-primary dark:text-theme-primary">
            {total}
          </span>
        </p>
      </div>

      {/* Enhanced Pagination */}
      <div className="relative group">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-600/5 to-primary-500/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 dark:shadow-lg dark:shadow-theme-primary-500/20 dark:shadow-theme-primary-500/20">
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
                "bg-transparent hover:bg-theme-primary hover:bg-theme-primary hover:to-theme-primary",
                "dark:hover:bg-theme-primary dark:hover:to-theme-primary",
                "text-gray-700 dark:text-gray-300 hover:text-theme-primary dark:hover:text-theme-primary",
                "border border-transparent hover:border-theme-primary dark:hover:border-theme-primary",
                "hover:shadow-md hover:scale-105 active:scale-95",
                "data-[hover=true]:bg-theme-primary data-[hover=true]:bg-theme-primary data-[hover=true]:bg-theme-primary",
                "dark:data-[hover=true]:bg-theme-primary dark:data-[hover=true]:bg-theme-primary",
                "cursor-pointer relative overflow-hidden"
              ),
              cursor: cn(
                "bg-theme-primary text-white font-semibold",
                "shadow-lg shadow-theme-primary dark:shadow-theme-primary",
                "border-2 border-theme-primary dark:border-theme-primary",
                "relative overflow-hidden"
              ),
              prev: cn(
                "min-w-12 h-10 font-medium transition-all duration-300",
                " from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                "text-gray-600 dark:text-gray-300 hover:text-theme-primary dark:hover:text-theme-primary",
                "border border-gray-200 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              ),
              next: cn(
                "min-w-12 h-10 font-medium transition-all duration-300",
                " from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                "text-gray-600 dark:text-gray-300 hover:text-theme-primary dark:hover:text-theme-primary",
                "border border-gray-200 dark:border-gray-600 hover:border-theme-primary  dark:hover:border-theme-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function Tags(props: {
  tags: Tag[];
  basePath?: string;
  resetPath?: string;
  enableSticky?: boolean;
  maxVisibleTags?: number;
}) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (props.enableSticky) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const scrollThreshold = 250;
        if (scrollPosition > scrollThreshold && !isSticky) {
          setIsSticky(true);
        } else if (scrollPosition <= scrollThreshold && isSticky) {
          setIsSticky(false);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
    return undefined;
  }, [isSticky, props.enableSticky]);

  const MAX_VISIBLE_TAGS = props.maxVisibleTags || 8;
  const hasMoreTags = props.tags.length > MAX_VISIBLE_TAGS;

  const renderTag = (tag: Tag, index: number) => {
    const basePath = props.basePath
      ? `${props.basePath}/${tag.id}`
      : `/tags/${tag.id}`;

    const isActive = pathname.startsWith(encodeURI(basePath));
    return (
      <Button
        key={tag.id || index}
        variant={isActive ? "solid" : "bordered"}
        radius="full"
        size="sm"
        as={Link}
        prefetch={false}
        href={basePath}
        className={cn(
          "px-1.5 py-1 h-8 font-medium transition-all duration-200",
          isActive
            ? "bg-theme-primary-500 text-white border-theme-primary-500 shadow-sm"
            : "border border-dark--theme-200 dark:border-dark--theme-800",
          "hover:shadow-md hover:border-theme-primary-200 dark:hover:border-theme-primary-800",
          !showAllTags && "flex-shrink-0"
        )}
      >
        {isActive && (
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
              isActive ? "brightness-200" : ""
            )}
            alt={tag.name}
          />
        )}
        <span
          className={cn(
            "text-sm font-medium transition-all duration-300",
            isActive
              ? "text-white tracking-wide"
              : "text-gray-700 dark:text-gray-300 group-hover:text-theme-primary dark:group-hover:text-theme-primary capitalize"
          )}
        >
          {tag.name}
        </span>
        {tag.count && (
          <span
            className={cn(
              "ml-1.5 text-xs font-normal",
              isActive ? "text-white" : "text-dark-500 dark:text-dark-400"
            )}
          >
            ({tag.count})
          </span>
        )}
      </Button>
    );
  };

  const visibleTags = showAllTags
    ? props.tags
    : props.tags.slice(0, MAX_VISIBLE_TAGS);

  const isAnyTagActive = props.tags.some((tag) => {
    const basePath = props.basePath
      ? `${props.basePath}/${tag.id}`
      : `/tags/${tag.id}`;
    return pathname.startsWith(encodeURI(basePath));
  });

  return (
    <div
      className={cn(
        "p-4 transition-all duration-300",
        props.enableSticky
          ? cn(
              "sticky top-4 z-10",
              isSticky
                ? "bg-white/95 dark:bg-gray-800/95 shadow-md backdrop-blur-sm"
                : "bg-transparent"
            )
          : "bg-inherit"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3
            className={cn(
              "text-lg font-bold transition-colors duration-300",
              isSticky
                ? "text-theme-primary dark:text-theme-primary"
                : "text-gray-900 dark:text-white"
            )}
          >
            Tags
          </h3>
          {hasMoreTags && (
            <Button
              variant="flat"
              // color="primary"
              radius="full"
              size="sm"
              className={cn(
                "px-4 py-1 font-medium transition-all duration-300 bg-theme-primary-10 text-theme-primary-700",
                isSticky && "shadow-sm"
              )}
              onPress={() => setShowAllTags(!showAllTags)}
            >
              {showAllTags ? (
                <>
                  <span className="hidden sm:inline">Show as single row</span>
                  <span className="sm:hidden">Single row</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="ml-1.5 transition-transform group-hover:-translate-y-0.5 dark:text-default-300"
                  >
                    <path
                      d="M3 10h18M3 14h18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Show all {props.tags.length} tags
                  </span>
                  <span className="sm:hidden">All tags</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="ml-1.5 transition-transform group-hover:translate-y-0.5 dark:text-default-300"
                  >
                    <path
                      d="M4 4h16v7H4V4zm0 9h16v7H4v-7z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </Button>
          )}
        </div>
        <div className="relative">
          {!showAllTags && (
            <div className="w-full flex flex-nowrap gap-2 overflow-x-auto pb-2 hide-scrollbar scrollbar-thin scrollbar-thumb-blue-500/30 dark:scrollbar-thumb-blue-700/30 scrollbar-track-transparent">
              <Button
                variant={!isAnyTagActive ? "solid" : "bordered"}
                radius="full"
                size="sm"
                as={Link}
                prefetch={false}
                href={props.resetPath || props.basePath || "/"}
                className={cn(
                  "px-3 py-1 h-8 font-medium transition-all duration-300 flex-shrink-0 group",
                  !isAnyTagActive
                    ? "bg-theme-primary-500 text-white border-theme-primary-500 shadow-sm"
                    : "border border-dark--theme-200 dark:border-dark--theme-800",
                  "hover:shadow-md hover:border-theme-primary-200 dark:hover:border-theme-primary-800"
                )}
              >
                {!isAnyTagActive && (
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
                <span>All Tags</span>
                <span
                  className={cn(
                    "ml-1.5 text-xs font-normal",
                    !isAnyTagActive
                      ? "text-white"
                      : "text-dark-500 dark:text-dark-400"
                  )}
                >
                  ({props.tags.length})
                </span>
              </Button>
              {visibleTags.map(renderTag)}
            </div>
          )}

          {showAllTags && (
            <div className="w-full flex flex-wrap gap-2">
              <Button
                variant={!isAnyTagActive ? "solid" : "bordered"}
                radius="full"
                size="sm"
                as={Link}
                prefetch={false}
                href={props.resetPath || props.basePath || "/"}
                className={cn(
                  "px-3 py-1 h-8 font-medium transition-all duration-200",
                  !isAnyTagActive
                    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                    : "border border-dark--theme-200 dark:border-dark--theme-800",
                  "hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800"
                )}
              >
                {!isAnyTagActive && (
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
                <span>All Tags</span>
                <span
                  className={cn(
                    "ml-1.5 text-xs font-normal",
                    !isAnyTagActive
                      ? "text-white"
                      : "text-dark-500 dark:text-dark-400"
                  )}
                >
                  ({props.tags.length})
                </span>
              </Button>
              {visibleTags.map(renderTag)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
