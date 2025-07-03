import { Button, cn } from "@heroui/react";
import { Link } from "@/i18n/navigation";
import { Tag } from "@/lib/content";
import { TagItem } from "./tag-item";
import { getButtonVariantStyles } from "../../utils/style-utils";

interface TagsListProps {
  tags: Tag[];
  basePath?: string;
  resetPath?: string;
  total?: number;
  showAllTags: boolean;
  visibleTags: Tag[];
  isAnyTagActive: boolean;
  mode?: "navigation" | "filter";
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
}

/**
 * Tags list component
 * Renders a list of tag items with "All Tags" option
 */
export function TagsList({
  tags,
  basePath,
  resetPath,
  total,
  showAllTags,
  visibleTags,
  isAnyTagActive,
  mode = "navigation",
  selectedTags = [],
  setSelectedTags,
}: TagsListProps) {
  // Handle tag click for filter mode
  const handleTagClick = (tagId: string) => {
    if (mode === "filter" && setSelectedTags) {
      if (selectedTags.includes(tagId)) {
        setSelectedTags(selectedTags.filter(id => id !== tagId));
      } else {
        setSelectedTags([...selectedTags, tagId]);
      }
    }
  };

  // Clear all tags for filter mode
  const clearAllTags = () => {
    if (mode === "filter" && setSelectedTags) {
      setSelectedTags([]);
    }
  };

  // Render a single tag (button for filter, link for navigation)
  const renderTag = (tag: Tag, index: number) => {
    if (mode === "filter") {
      const isActive = selectedTags.includes(tag.id);
      return (
        <Button
          key={tag.id || index}
          variant={isActive ? "solid" : "bordered"}
          radius="full"
          size="sm"
          onPress={() => handleTagClick(tag.id)}
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
            <img
              src={tag.icon_url}
              width={20}
              height={20}
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
    } else {
      // Navigation mode
      const tagBasePath = basePath ? `${basePath}/${tag.id}` : `/tags/${tag.id}`;
      // isActive logic for navigation mode (optional, can be improved)
      return (
        <TagItem
          key={tag.id || index}
          tag={tag}
          isActive={false}
          href={tagBasePath}
          showCount={true}
        />
      );
    }
  };

  // All Tags button (deduplicated)
  const renderAllTagsButton = (count: number) => (
    <Button
      variant={!isAnyTagActive ? "solid" : "bordered"}
      radius="full"
      size="sm"
      as={mode === "filter" ? undefined : Link}
      prefetch={mode === "filter" ? undefined : false}
      href={mode === "filter" ? undefined : (resetPath || basePath || "/")}
      onPress={mode === "filter" ? clearAllTags : undefined}
      className={getButtonVariantStyles(
        !isAnyTagActive,
        "px-3 py-1 h-8 font-medium transition-all duration-300 flex-shrink-0 group capitalize"
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
          !isAnyTagActive ? "text-white" : "text-dark-500 dark:text-dark-400"
        )}
      >
        ({count})
      </span>
    </Button>
  );

  return (
    <div className="relative">
      {!showAllTags && (
        <div className="w-full flex flex-nowrap gap-2 overflow-x-auto pb-2 hide-scrollbar scrollbar-thin scrollbar-thumb-theme-primary-10 dark:scrollbar-thumb-theme-primary-10 scrollbar-track-transparent">
          {renderAllTagsButton(total ?? tags.length)}
          {visibleTags.map(renderTag)}
        </div>
      )}
      {showAllTags && (
        <div className="w-full flex flex-wrap gap-2">
          {renderAllTagsButton(tags.length)}
          {visibleTags.map(renderTag)}
        </div>
      )}
    </div>
  );
} 