import { Button, cn } from "@heroui/react";
import { Link, usePathname } from "@/i18n/navigation";
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
  mode?: 'navigation' | 'filter';
  setSelectedTag?: (tag: string | null) => void;
  selectedTag?: string | null;
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
  mode = 'navigation',
  setSelectedTag,
  selectedTag,
}: TagsListProps) {
  const pathname = usePathname();

  const renderTag = (tag: Tag, index: number) => {
    const tagBasePath = basePath
      ? `${basePath}/${tag.id}`
      : `/tags/${tag.id}`;

    const isActive = mode === 'filter'
      ? selectedTag === tag.id
      : pathname.startsWith(encodeURI(tagBasePath));

    if (mode === 'filter' && setSelectedTag) {
      return (
        <Button
          key={tag.id || index}
          variant={isActive ? "solid" : "bordered"}
          radius="full"
          size="sm"
          className={getButtonVariantStyles(
            isActive,
            "px-1.5 py-1 h-8 font-medium transition-all duration-200 flex-shrink-0"
          )}
          onClick={() => setSelectedTag(isActive ? null : tag.id)}
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
    }

    // navigation mode (default)
    return (
      <TagItem
        key={tag.id || index}
        tag={tag}
        isActive={isActive}
        href={tagBasePath}
        showCount={true}
      />
    );
  };

  return (
    <div className="relative">
      {!showAllTags && (
        <div className="w-full flex flex-nowrap gap-2 overflow-x-auto pb-2 hide-scrollbar scrollbar-thin scrollbar-thumb-theme-primary-10 dark:scrollbar-thumb-theme-primary-10 scrollbar-track-transparent">
          {/* All Tags Button */}
          {mode === 'filter' && setSelectedTag ? (
            <Button
              variant={!isAnyTagActive ? "solid" : "bordered"}
              radius="full"
              size="sm"
              className={getButtonVariantStyles(
                !isAnyTagActive,
                "px-3 py-1 h-8 font-medium transition-all duration-300 flex-shrink-0 group capitalize"
              )}
              onClick={() => setSelectedTag(null)}
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
                ({total})
              </span>
            </Button>
          ) : (
            <Button
              variant={!isAnyTagActive ? "solid" : "bordered"}
              radius="full"
              size="sm"
              as={Link}
              prefetch={false}
              href={resetPath || basePath || "/"}
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
                  !isAnyTagActive
                    ? "text-white"
                    : "text-dark-500 dark:text-dark-400"
                )}
              >
                ({total})
              </span>
            </Button>
          )}
          {/* Visible Tags */}
          {visibleTags.map(renderTag)}
        </div>
      )}

      {showAllTags && (
        <div className="w-full flex flex-wrap gap-2">
          {/* All Tags Button */}
          {mode === 'filter' && setSelectedTag ? (
            <Button
              variant={!isAnyTagActive ? "solid" : "bordered"}
              radius="full"
              size="sm"
              className={getButtonVariantStyles(
                !isAnyTagActive,
                "px-3 py-1 h-8 font-medium transition-all duration-200"
              )}
              onClick={() => setSelectedTag(null)}
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
                ({tags.length})
              </span>
            </Button>
          ) : (
            <Button
              variant={!isAnyTagActive ? "solid" : "bordered"}
              radius="full"
              size="sm"
              as={Link}
              prefetch={false}
              href={resetPath || basePath || "/"}
              className={getButtonVariantStyles(
                !isAnyTagActive,
                "px-3 py-1 h-8 font-medium transition-all duration-200"
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
                ({tags.length})
              </span>
            </Button>
          )}
          {/* All Tags */}
          {visibleTags.map(renderTag)}
        </div>
      )}
    </div>
  );
} 