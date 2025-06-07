"use client";

import { Category } from "@/lib/content";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils/index";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Select, SelectItem } from "@/components/ui/select";

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
          <span
            className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[100px] md:max-w-full"
            title={fullName}
          >
            {displayName}
          </span>
          <span
            className={cn(
              "ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs transition-colors duration-300",
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
            "group h-7 sm:h-9 whitespace-nowrap py-1 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm",
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
  const [selectedCategory, setSelectedCategory] = useState("");

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
    [pathname, basePath]
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
    () => categories.map(renderCategory),
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

  // Set initial selected value based on current path
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
    <div className="space-y-1 sm:space-y-2">
      {/* Mobile: Select dropdown */}
      <div className="md:hidden w-full">
        <Select>
          <select
            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {selectItems}
          </select>
        </Select>
      </div>

      {/* Desktop: Buttons */}
      <div className="hidden md:flex flex-wrap gap-1 sm:gap-2">
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
