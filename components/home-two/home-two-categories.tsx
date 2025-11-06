"use client";

import { Category } from "@/lib/content";
import { Link, usePathname } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { cn } from "@/lib/utils/index";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import clsx from "clsx";

// Style constants
const SCROLL_CONTAINER_STYLES = clsx(
  "relative flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 pr-8 scroll-smooth",
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1",
  "after:bg-gradient-to-r after:from-transparent after:via-blue-100/20 after:to-transparent",
  "dark:after:via-blue-900/10"
);

const SCROLL_FADE_LEFT = clsx(
  "absolute left-0 top-0 bottom-4 w-16 pointer-events-none z-[5]",
  "bg-gradient-to-r from-white via-white/80 to-transparent",
  "dark:from-gray-900 dark:via-gray-900/80",
  "opacity-0 transition-opacity duration-300"
);

const SCROLL_FADE_RIGHT = clsx(
  "absolute right-0 top-0 bottom-4 w-16 pointer-events-none z-[5]",
  "bg-gradient-to-l from-white via-white/80 to-transparent",
  "dark:from-gray-900 dark:via-gray-900/80",
  "opacity-0 transition-opacity duration-300"
);

const STICKY_LEFT_STYLES = clsx(
  "sticky left-0 flex-shrink-0 z-10 pr-7",
  "bg-gradient-to-r from-white via-white to-transparent",
  "dark:from-gray-900 dark:via-gray-900"
);

const STICKY_RIGHT_STYLES = clsx(
  "sticky right-0 flex-shrink-0 pl-4",
  "bg-gradient-to-l from-white via-white to-transparent",
  "dark:from-gray-900 dark:via-gray-900"
);

const MORE_BUTTON_STYLES = clsx(
  "h-8 py-1.5 text-xs flex items-center gap-1.5 rounded-md",
  "bg-theme-primary-10 hover:bg-theme-primary-20",
  "dark:bg-theme-primary-10 dark:hover:bg-theme-primary-20",
  "text-theme-primary-700 dark:text-theme-primary-300",
  "border border-theme-primary-200 dark:border-theme-primary-800",
  "shadow-sm hover:shadow transition-all duration-200"
);

const TOGGLE_BUTTON_STYLES = clsx(
  "px-4 py-1.5 font-medium transition-all duration-300 rounded-full",
  "text-theme-primary bg-theme-primary-10",
  "hover:bg-theme-primary-20 hover:shadow-sm hover:scale-105",
  "active:scale-95",
  "text-xs sm:text-sm h-8",
  "focus:outline-none focus:ring-2 focus:ring-theme-primary-300 focus:ring-offset-2"
);

const CATEGORIES_WRAPPER_BASE = "flex items-center gap-2 sm:gap-3 transition-all duration-500";
const CATEGORIES_WRAPPER_COLLAPSED = clsx(CATEGORIES_WRAPPER_BASE, "flex-nowrap");
const CATEGORIES_WRAPPER_EXPANDED = clsx(CATEGORIES_WRAPPER_BASE, "flex-wrap");

type Home2CategoriesProps = {
  categories: Category[];
  basePath?: string;
  resetPath?: string;
  mode?: "navigation" | "filter";
  selectedCategories?: string[];
  onCategoryToggle?: (categoryId: string | "clear-all") => void;
  totalItems?: number;
  showAllCategories?: boolean;
  onToggleCategories?: () => void;
};

type CategoryButtonProps = {
  href: string;
  isActive: boolean;
  displayName: string;
  count: number;
  isTextTruncated?: boolean;
  fullName?: string;
  onClick?: () => void;
};

const useCategoryState = (categories: Category[]) => {
  const pathname = usePathname();
  const totalItems = useMemo(
    () => categories.reduce((sum, cat) => sum + (cat.count || 0), 0),
    [categories]
  );

  const isHomeActive = useMemo(
    () =>
      pathname === "/" ||
      pathname === "/categories" ||
      pathname.startsWith("/discover"),
    [pathname]
  );

  return {
    totalItems,
    isHomeActive,
    pathname,
  };
};

// Memoized components
const CategoryButton = memo(
  React.forwardRef<HTMLDivElement, CategoryButtonProps>(
    (
      {
        href,
        isActive,
        displayName,
        count,
        isTextTruncated,
        fullName,
        onClick,
      },
      ref
    ) => {
      const buttonContent = useMemo(
        () => (
          <>
            <span
              className="text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[120px] md:max-w-full !capitalize font-medium"
              title={fullName}
            >
              {displayName}
            </span>
            <span
              className={cn(
                "ml-1 sm:ml-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs transition-all duration-300 capitalize",
                isActive
                  ? "bg-theme-primary-20 text-white dark:text-theme-primary-300 dark:bg-theme-primary-10 scale-105"
                  : "bg-gray-200/80 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300"
              )}
            >
              {count}
            </span>
          </>
        ),
        [displayName, count, isActive, fullName]
      );

      const button = useMemo(
        () => (
          <Button
            as={Link}
            href={href}
            onPress={onClick}
            className={cn(
              "group h-7 sm:h-9 whitespace-nowrap py-1 sm:py-1.5 px-3 sm:px-4 text-xs sm:text-sm transition-all duration-300 ease-in-out hover:scale-105",
              {
                "bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 dark:from-theme-primary-600 dark:to-theme-primary-700 text-white border-none shadow-md shadow-blue-500/20 dark:shadow-theme-primary-700/20 ring-2 ring-white/20 dark:ring-blue-500/30":
                  isActive,
                "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/70 bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md":
                  !isActive,
              }
            )}
          >
            {buttonContent}
          </Button>
        ),
        [href, isActive, buttonContent, onClick]
      );

      if (isTextTruncated && fullName) {
        return (
          <div ref={ref} className="relative group" title={fullName}>
            {button}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 !capitalize"
              role="tooltip"
            >
              {fullName}
            </div>
          </div>
        );
      }

      return <div ref={ref}>{button}</div>;
    }
  )
);

CategoryButton.displayName = "CategoryButton";

export function HomeTwoCategories({
  categories,
  basePath,
  resetPath,
  mode = "navigation",
  selectedCategories = [],
  onCategoryToggle,
  totalItems,
  showAllCategories = false,
  onToggleCategories,
}: Home2CategoriesProps) {
  const t = useTranslations("listing");
  const tCommon = useTranslations("common");
  const router = useRouter();
  // Use totalItems prop for All Categories button, fallback to calculated value
  const { totalItems: calculatedTotalItems, isHomeActive, pathname } = useCategoryState(categories);
  const allCategoriesCount = totalItems ?? calculatedTotalItems;
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hiddenCategories, setHiddenCategories] = useState<Category[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<(HTMLDivElement | null)[]>([]);

  const renderCategory = useCallback(
    (category: Category, index?: number) => {
      if (mode === "filter") {
        const isActive = selectedCategories.includes(category.id);
        const displayName = category.name;

        return (
          <CategoryButton
            key={category.id}
            href="#"
            isActive={isActive}
            displayName={displayName}
            count={category.count || 0}
            isTextTruncated
            fullName={category.name}
            onClick={() => onCategoryToggle?.(category.id)}
            ref={
              index !== undefined
                ? (el) => { categoriesRef.current[index] = el; }
                : undefined
            }
          />
        );
      } else {
        const href = basePath
          ? `${basePath}/${category.id}`
          : `/categories/${category.id}`;
        const isActive = pathname === encodeURI(href) || pathname.startsWith(encodeURI(href) + '/');
        const displayName = category.name;

        return (
          <CategoryButton
            key={category.id}
            href={href}
            isActive={isActive}
            displayName={displayName}
            count={category.count || 0}
            isTextTruncated
            fullName={category.name}
            ref={
              index !== undefined
                ? (el) => { categoriesRef.current[index] = el; }
                : undefined
            }
          />
        );
      }
    },
    [basePath, pathname, mode, selectedCategories, onCategoryToggle]
  );

  const categoriesList = useMemo(
    () => categories.map((category, index) => renderCategory(category, index)),
    [categories, renderCategory]
  );

  // Update scroll indicators
  const updateScrollIndicators = useCallback(() => {
    if (scrollContainerRef.current && !showAllCategories) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, [showAllCategories]);

  // Initialize and update scroll indicators
  useEffect(() => {
    updateScrollIndicators();
    const container = scrollContainerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(updateScrollIndicators);
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  }, [updateScrollIndicators, categories]);

  // Fix flickering: Reset hiddenCategories when toggling between collapsed/expanded views
  useEffect(() => {
    setHiddenCategories([]);
    setCanScrollLeft(false);
    setCanScrollRight(false);
  }, [showAllCategories]);

  useEffect(() => {
    if (isHomeActive) {
      setSelectedCategory("all");
    } else {
      const currentCategory = categories.find((category) => {
        const href = basePath
          ? `${basePath}/${category.id}`
          : `/categories/${category.id}`;
        return pathname === encodeURI(href) || pathname.startsWith(encodeURI(href) + '/');
      });

      if (currentCategory) {
        setSelectedCategory(currentCategory.id);
      }
    }
  }, [categories, pathname, isHomeActive, basePath]);

  // Handle category change from select
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);

    if (mode === "filter") {
      if (value === "all") {
        onCategoryToggle?.("clear-all");
      } else {
        onCategoryToggle?.(value);
      }
    } else {
      if (value === "all") {
        router.push(resetPath || "/");
      } else {
        const category = categories.find((c) => c.id === value);
        if (category) {
          const href = basePath
            ? `${basePath}/${category.id}`
            : `/categories/${category.id}`;
          router.push(href);
        }
      }
    }
  };



  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Mobile Select Dropdown - Enhanced */}
      <div className="md:hidden w-full px-1">
        <div className="relative">
          <select
            className="w-full p-3 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 appearance-none focus:ring-2 focus:ring-theme-primary-500 focus:border-transparent transition-all duration-200"
            value={selectedCategory}
            onChange={handleCategoryChange}
            aria-label="Select category"
          >
            <option value="all">
              {t("ALL_CATEGORIES")} ({allCategoriesCount})
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count || 0})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop Categories - Enhanced */}
      <div className="hidden md:block">
        <div
            ref={scrollContainerRef}
            onScroll={(e) => {
              // Only track scroll when in collapsed mode
              if (scrollContainerRef.current && !showAllCategories) {
                const container = e.currentTarget;
                const containerRect = container.getBoundingClientRect();
                // Add threshold to detect categories earlier (50px before they're fully hidden)
                const visibilityThreshold = 50;

                const visible: string[] = [];
                const hidden: Category[] = [];

                categories.forEach((category, index) => {
                  const el = categoriesRef.current[index];
                  if (el) {
                    const rect = el.getBoundingClientRect();

                    // Check if element is visible within container bounds with threshold
                    const isVisible =
                      rect.left >= containerRect.left - visibilityThreshold &&
                      rect.right <= containerRect.right + visibilityThreshold;

                    if (isVisible) {
                      visible.push(category.id);
                    } else {
                      hidden.push(category);
                    }
                  }
                });

                setHiddenCategories(hidden);
                updateScrollIndicators();
              }
            }}
            className={showAllCategories ? "relative pb-4 pr-8 transition-all duration-500" : SCROLL_CONTAINER_STYLES}
            role="region"
            aria-label="Categories filter"
          >
            {/* Scroll fade indicators */}
            {!showAllCategories && canScrollLeft && (
              <div
                className={SCROLL_FADE_LEFT}
                style={{ opacity: canScrollLeft ? 1 : 0 }}
                aria-hidden="true"
              />
            )}
            {!showAllCategories && canScrollRight && (
              <div
                className={SCROLL_FADE_RIGHT}
                style={{ opacity: canScrollRight ? 1 : 0 }}
                aria-hidden="true"
              />
            )}

            <div className={showAllCategories ? CATEGORIES_WRAPPER_EXPANDED : CATEGORIES_WRAPPER_COLLAPSED}>
              <div className={showAllCategories ? "" : STICKY_LEFT_STYLES}>
                <style jsx global>{`
                  .hover-lift {
                    transition: transform 0.2s ease;
                  }
                  .hover-lift:hover {
                    transform: translateY(-1px);
                  }
                `}</style>
                <CategoryButton
                  href={mode === "filter" ? "#" : (resetPath || "/")}
                  isActive={mode === "filter" ? selectedCategories.length === 0 : isHomeActive}
                  displayName={t("ALL_CATEGORIES")}
                  count={allCategoriesCount}
                  onClick={mode === "filter" ? () => onCategoryToggle?.("clear-all") : undefined}
                />
              </div>
              {categoriesList}
            </div>
            {!showAllCategories && (
              <div className={STICKY_RIGHT_STYLES}>
                {hiddenCategories.length > 0 && (
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        className={MORE_BUTTON_STYLES}
                        aria-label={`Show ${hiddenCategories.length} more ${hiddenCategories.length === 1 ? 'category' : 'categories'}`}
                      >
                        <span className="font-medium">
                          +{hiddenCategories.length}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3.5 h-3.5"
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-1.5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5 uppercase">
                          {tCommon("MORE")} {t("CATEGORIES")}
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
                            {hiddenCategories.length}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto w-full pr-1 overflow-hidden scrollbar-none">
                          {hiddenCategories.map((category) => (
                            <Button
                              key={category.id}
                              as={Link}
                              href={
                                basePath
                                  ? `${basePath}/${category.id}`
                                  : `/categories/${category.id}`
                              }
                              className="flex justify-between items-center h-8 text-xs py-1.5 px-3 text-gray-700 dark:text-gray-300 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70 rounded-md transition-colors border border-gray-100 dark:border-gray-700 hover:border-theme-primary-200 dark:hover:border-theme-primary-800 w-full"
                            >
                              <span className="truncate max-w-[140px] text-left">
                                {category.name}
                              </span>
                              <span className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
                                {category.count || 0}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}


export function Categories(props: {
  categories: Category[];
  basePath?: string;
  resetPath?: string;
  enableSticky?: boolean;
  maxVisibleTags?: number;
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);
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

  const MAX_VISIBLE_CATEGORIES = props.maxVisibleTags || 8;
  const hasMoreTags = props.categories.length > MAX_VISIBLE_CATEGORIES;

  const renderCategory = (category: Category, index: number) => {
    const basePath = props.basePath
      ? `${props.basePath}/${category.id}`
      : `/categories/${category.id}`;

    const isActive = pathname === encodeURI(basePath) || pathname.startsWith(encodeURI(basePath) + '/');
    return (
      <Button
        key={category.id || index}
        variant={isActive ? "solid" : "bordered"}
        radius="full"
        size="sm"
        as={Link}
        prefetch={false}
        href={basePath}
        className={cn(
          "px-1.5 py-1 h-8 font-medium transition-all duration-200",
          isActive
            ? "bg-theme-primary text-white border-theme-primary shadow-sm"
            : "border border-dark--theme-200 dark:border-dark--theme-800",
          "hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800",
          !showAllCategories && "flex-shrink-0"
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
        {category.icon_url && (
          <Image
            width={20}
            height={20}
            src={category.icon_url}
            className={cn(
              "w-4 h-4 mr-1.5 transition-transform",
              isActive ? "brightness-200" : ""
            )}
            alt={category.name}
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
          {category.name}
        </span>
        {category.count && (
          <span
            className={cn(
              "ml-1.5 text-xs font-normal",
              isActive ? "text-white" : "text-dark-500 dark:text-dark-400"
            )}
          >
            ({category.count})
          </span>
        )}
      </Button>
    );
  };

  const visibleCategories = showAllCategories
    ? props.categories
    : props.categories.slice(0, MAX_VISIBLE_CATEGORIES);

  const isAnyTagActive = props.categories.some((category) => {
    const basePath = props.basePath
      ? `${props.basePath}/${category.id}`
      : `/categories/${category.id}`;
    return pathname === encodeURI(basePath) || pathname.startsWith(encodeURI(basePath) + '/');
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
            Categories
          </h3>
          {hasMoreTags && (
            <Button
              variant="flat"
              // color="primary"
              radius="full"
              size="sm"
              className={cn(
                "px-4 py-1 font-medium transition-all duration-300  text-theme-primary bg-theme-primary-10 hover:to-theme-primary",
                isSticky && "shadow-sm"
              )}
              onPress={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? (
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
                    Show all {props.categories.length} categories
                  </span>
                  <span className="sm:hidden">All categories</span>
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
          {!showAllCategories && (
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
                    ? "bg-theme-primary text-white border-theme-primary-500 shadow-sm"
                    : "border border-dark--theme-200 dark:border-dark--theme-800",
                  "hover:shadow-md hover:border-theme-primary dark:hover:border-theme-primary"
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
                <span>All Categories</span>
                <span
                  className={cn(
                    "ml-1.5 text-xs font-normal",
                    !isAnyTagActive
                      ? "text-white"
                      : "text-dark-500 dark:text-dark-400"
                  )}
                >
                  ({props.categories.length})
                </span>
              </Button>
              {visibleCategories.map(renderCategory)}
            </div>
          )}

          {showAllCategories && (
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
                <span>All Categories</span>
                <span
                  className={cn(
                    "ml-1.5 text-xs font-normal",
                    !isAnyTagActive
                      ? "text-white"
                      : "text-dark-500 dark:text-dark-400"
                  )}
                >
                  ({props.categories.length})
                </span>
              </Button>
              {visibleCategories.map(renderCategory)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}