"use client";

import { Category } from "@/lib/content";
import { Link, usePathname } from "@/i18n/navigation";
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
import { Select, SelectItem } from "@/components/ui/select";


// Types
type Home2CategoriesProps = {
  categories: Category[];
  basePath?: string;
  resetPath?: string;
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
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-300 dark:bg-blue-500/30 scale-105"
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
                "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-none shadow-md shadow-blue-500/20 dark:shadow-blue-700/20 ring-2 ring-white/20 dark:ring-blue-500/30":
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
}: Home2CategoriesProps) {
  const t = useTranslations("listing");
  const tCommon = useTranslations("common");
  const { totalItems, isHomeActive, pathname } = useCategoryState(categories);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hiddenCategories, setHiddenCategories] = useState<Category[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<(HTMLDivElement | null)[]>([]);

  const renderCategory = useCallback(
    (category: Category, index?: number) => {
      const href = basePath
        ? `${basePath}/${category.id}`
        : `/categories/${category.id}`;
      const isActive = pathname.startsWith(encodeURI(href));
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
              ? (el) => (categoriesRef.current[index] = el as any)
              : undefined
          }
        />
      );
    },
    [basePath, pathname]
  );

  // Handle category change from select
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);

    // Redirect to the selected category
    if (value === "all") {
      window.location.href = resetPath || "/";
    } else {
      const category = categories.find((c) => c.id === value);
      if (category) {
        const href = basePath
          ? `${basePath}/${category.id}`
          : `/categories/${category.id}`;
        window.location.href = href;
      }
    }
  };

  const categoriesList = useMemo(
    () => categories.map((category, index) => renderCategory(category, index)),
    [categories, renderCategory]
  );

  // Generate select items
  const selectItems = useMemo(() => {
    const items = [
      <SelectItem key="all" value="all">
        {t("ALL_CATEGORIES")} ({totalItems})
      </SelectItem>,
    ];

    categories.forEach((category) => {
      items.push(
        <SelectItem key={category.id} value={category.id}>
          {category.name} ({category.count || 0})
        </SelectItem>
      );
    });

    return items;
  }, [categories, t, totalItems]);

  useEffect(() => {
    if (isHomeActive) {
      setSelectedCategory("all");
    } else {
      const currentCategory = categories.find((category) => {
        const href = basePath
          ? `${basePath}/${category.id}`
          : `/categories/${category.id}`;
        return pathname.startsWith(encodeURI(href));
      });

      if (currentCategory) {
        setSelectedCategory(currentCategory.id);
      }
    }
  }, [categories, pathname, isHomeActive, basePath]);

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="md:hidden w-full px-1">
        <Select>
          <select
            className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {selectItems}
          </select>
        </Select>
      </div>

      <div className="hidden md:block max-w-7xl mx-auto px-1">
        <div className="flex flex-col gap-4">
          <div
            ref={scrollContainerRef}
            onScroll={(e) => {
              if (scrollContainerRef.current) {
                const container = e.currentTarget;
         

                const visible: string[] = [];
                const hidden: Category[] = [];

                categories.forEach((category, index) => {
                  const el = categoriesRef.current[index];
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    if (
                      rect.left >= containerRect.left &&
                      rect.right <= containerRect.right
                    ) {
                      visible.push(category.id);
                    } else {
                      hidden.push(category);
                    }
                  }
                });

                setHiddenCategories(hidden);
              }
            }}
            className="relative flex items-center gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-transparent after:via-blue-100/20 after:to-transparent dark:after:via-blue-900/10"
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-nowrap">
              <div className="sticky left-0 flex-shrink-0 bg-gradient-to-r from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent pr-7 z-10 pl-1 py-1">
                <style jsx global>{`
                  .hover-lift {
                    transition: transform 0.2s ease;
                  }
                  .hover-lift:hover {
                    transform: translateY(-1px);
                  }
                `}</style>
                <CategoryButton
                  href={resetPath || "/"}
                  isActive={isHomeActive}
                  displayName={t("ALL_CATEGORIES")}
                  count={totalItems}
                />
              </div>
              {categoriesList}
            </div>
            <div className="sticky right-0 flex-shrink-0 bg-gradient-to-l ">
              {hiddenCategories.length > 0 && (
                <Popover>
                  <PopoverTrigger>
                    <Button className="h-8 py-1.5 text-xs flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow transition-all rounded-md">
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
                            className="flex justify-between items-center h-8 text-xs py-1.5 px-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70 rounded-md transition-colors border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 w-full"
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
          </div>
        </div>
      </div>
    </div>
  );
}
