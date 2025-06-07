"use client";

import { Category } from "@/lib/content";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils/index";
import { memo, useCallback, useMemo } from "react";

// Constants
const MAX_NAME_LENGTH = 20;

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
    () => pathname === "/" || pathname.startsWith("/discover"),
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
  ({
    href,
    isActive,
    displayName,
    count,
    isTextTruncated,
    fullName,
    onClick,
  }: CategoryButtonProps) => {
    const buttonContent = useMemo(
      () => (
        <>
          <span className="text-sm truncate" title={fullName}>
            {displayName}
          </span>
          <span
            className={cn(
              "ml-2 px-2 py-1 rounded-full text-xs  transition-colors duration-300",
              isActive
                ? "bg-white/20 text-white"
                : "bg-gray-200 dark:bg-gray-200/10 text-gray-600 dark:text-gray-400"
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
            "font-medium text-left justify-start items-center transition-all duration-200 h-8 mb-1",
            {
              "bg-blue-500 dark:bg-blue-600 text-white border border-blue-500 dark:border-blue-600":
                isActive,
              "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700":
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
        <div className="relative group" title={fullName}>
          {button}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
            role="tooltip"
          >
            {fullName}
          </div>
        </div>
      );
    }

    return button;
  }
);

CategoryButton.displayName = "CategoryButton";

export function HomeTwoCategories({
  categories,
  basePath,
  resetPath,
}: Home2CategoriesProps) {
  const t = useTranslations("listing");
  const { totalItems, isHomeActive, pathname } = useCategoryState(categories);

  const renderCategory = useCallback(
    (category: Category) => {
      const href = basePath
        ? `${basePath}/${category.id}`
        : `/categories/${category.id}`;
      const isActive = pathname.startsWith(encodeURI(href));
      const displayName = category.name;
      const isTextTruncated = category.name.length > MAX_NAME_LENGTH;

      return (
        <CategoryButton
          key={category.id}
          href={href}
          isActive={isActive}
          displayName={displayName}
          count={category.count || 0}
          isTextTruncated={isTextTruncated}
          fullName={category.name}
        />
      );
    },
    [pathname]
  );

  const categoriesList = useMemo(
    () => categories.map(renderCategory),
    [categories, renderCategory]
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <CategoryButton
          href={resetPath || "/"}
          isActive={isHomeActive}
          displayName={t("ALL_CATEGORIES")}
          count={totalItems}
        />
        {categoriesList}
      </div>
    </div>
  );
}
