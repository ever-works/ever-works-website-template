import { Button, Tooltip, cn } from "@heroui/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CategoryItemProps } from "../../types";
import { truncateText, isTextTruncated as checkTextTruncated, formatDisplayName } from "../../utils/text-utils";
import { FILTER_CONSTANTS } from "../../constants";

/**
 * Individual category item component
 */
export function CategoryItem({ 
  category, 
  isActive, 
  href, 
  isAllCategories = false,
  totalItems,
  mode = "navigation",
  onToggle
}: CategoryItemProps) {
  const t = useTranslations("listing");
  const formattedName = formatDisplayName(category.name);
  const displayName = truncateText(formattedName);
  const textIsTruncated = checkTextTruncated(formattedName);

  const handleClick = (e: React.MouseEvent) => {
    if (mode === "filter") {
      e.preventDefault();
      if (onToggle) {
        onToggle(category.id);
      } else {
        console.warn("CategoryItem: onToggle is required when mode is 'filter'");
      }
    }
  };

  return (
    <Tooltip
      content={isAllCategories ? t("ALL_CATEGORIES") : formattedName}
      placement="right"
      delay={FILTER_CONSTANTS.TOOLTIP_DELAY}
      closeDelay={FILTER_CONSTANTS.TOOLTIP_CLOSE_DELAY}
      isDisabled={!textIsTruncated}
      classNames={{
        content: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2.5 py-1.5 rounded-md text-sm font-medium shadow-lg",
      }}
    >
      <div>
        <Button
          className={cn(
            "font-medium text-left justify-start items-center transition-colors duration-300 mb-1 h-10 px-3",
            "hover:transform-none active:transform-none",
            {
              "bg-theme-primary-500 text-white": isActive,
              "bg-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800": !isActive,
            }
          )}
          radius="md"
          variant="light"
          as={mode === "filter" ? "button" : Link}
          href={mode === "filter" ? undefined : href}
          onClick={mode === "filter" ? handleClick : undefined}
          fullWidth
        >
          <div className="flex items-center justify-between w-full group">
            <span
              className="font-medium truncate pr-2 text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
              title={textIsTruncated ? formattedName : undefined}
            >
              {isAllCategories ? t("ALL_CATEGORIES") : displayName}
            </span>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300 flex-shrink-0 group-hover:scale-105",
                isActive
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              )}
            >
              {isAllCategories ? totalItems : category.count}
            </span>
          </div>
        </Button>
      </div>
    </Tooltip>
  );
} 