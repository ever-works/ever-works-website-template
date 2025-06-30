import { Button, cn } from "@heroui/react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { TagItemProps } from "../../types";
import { getButtonVariantStyles } from "../../utils/style-utils";

/**
 * Individual tag item component
 */
export function TagItem({ tag, isActive, href, showCount = true }: TagItemProps) {
  return (
    <Button
      variant={isActive ? "solid" : "bordered"}
      radius="full"
      size="sm"
      as={Link}
      prefetch={false}
      href={href}
      className={getButtonVariantStyles(
        isActive,
        "px-1.5 py-1 h-8 font-medium transition-all duration-200 flex-shrink-0"
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
      
      {showCount && tag.count && (
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
} 