"use client";

import { useState, useMemo, useCallback } from "react";
import { Tag } from "@/lib/content";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useTranslations } from "next-intl";
import { ChevronDown, Search, Tag as TagIcon, X } from "lucide-react";
import { cn } from "@/lib/utils/index";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

// Types
type HomeTwoTagsSelectorProps = {
  tags: Tag[];
};

type TagButtonProps = {
  tag: Tag;
  isActive: boolean;
  href: string;
  onPress?: () => void;
};

// Constants
const MAX_TAG_NAME_LENGTH = 20;
const TRUNCATE_SUFFIX = "...";

// Utility functions
const truncateText = (text: string): string => {
  if (!text || text.length <= MAX_TAG_NAME_LENGTH) return text;
  return `${text.substring(0, MAX_TAG_NAME_LENGTH)}${TRUNCATE_SUFFIX}`;
};

// Memoized components
const TagButton = ({ tag, isActive, href, onPress }: TagButtonProps) => {
  const displayName = truncateText(tag.name);
  const isTextTruncated = tag.name.length > MAX_TAG_NAME_LENGTH;

  return (
    <Button
      onPress={onPress}
      as={Link}
      href={href}
      className={cn(
        "group w-full font-medium text-left h-6 justify-start items-center transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        {
          "bg-blue-500 dark:bg-blue-600 text-white border border-blue-500 dark:border-blue-600":
            isActive,
          "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-800":
            !isActive,
        }
      )}
    >
      <div className="flex items-center justify-between w-full px-3 py-2">
        <div className="flex items-center gap-2">
          {isActive && (
            <svg
              className="w-3 h-3 text-white"
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
          <span
            className={cn(
              "text-sm transition-colors truncate pr-2 capitalize",
              isActive
                ? "text-white"
                : "text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            )}
            title={isTextTruncated ? tag.name : undefined}
          >
            {displayName}
          </span>
        </div>
        {tag.count && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-md transition-colors capitalize",
              isActive
                ? "bg-white/20 text-white capitalize"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 capitalize"
            )}
          >
            {tag.count}
          </span>
        )}
      </div>
    </Button>
  );
};

export const HomeTwoTagsSelector = ({ tags }: HomeTwoTagsSelectorProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations();

  const isTagPage = pathname.includes("/tags/");
  const currentTagId = isTagPage ? pathname.split("/tags/")[1] : null;
  const currentTag = useMemo(
    () => (currentTagId ? tags.find((tag) => tag.id === currentTagId) : null),
    [currentTagId, tags]
  );

  const handleClearTag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push("/");
    },
    [router]
  );

  const filteredTags = useMemo(() => {
    if (!searchTerm) return tags;
    const searchLower = searchTerm.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(searchLower));
  }, [tags, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Popover placement="bottom" offset={10}>
        <PopoverTrigger>
          <Button
            disableRipple
            className={cn(
              "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 h-9 text-sm text-blue-600 dark:text-blue-400 transition-colors duration-300",
              "group flex items-center gap-2"
            )}
            radius="sm"
            variant="light"
          >
            <TagIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="text-sm font-bold capitalize">
              {currentTag ? currentTag.name : t("listing.TAGS")}
            </span>
            {currentTag && (
              <>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({currentTag.count})
                </span>
                <span
                  onClick={handleClearTag}
                  className="ml-1 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Clear tag selection"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleClearTag(e as any);
                    }
                  }}
                >
                  <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                </span>
              </>
            )}
            <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:rotate-180" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 max-h-[400px] w-[320px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          <div className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("listing.SEARCH")}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
              />
              {searchTerm && (
                <Button
                  onPress={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Tags List */}
            <div className="max-h-[250px] overflow-y-auto overflow-hidden scrollbar-none space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-none">
              {filteredTags.map((tag, index) => {
                const href = `/tags/${tag.id}`;
                const isActive = pathname.startsWith(encodeURI(href));
                return (
                  <TagButton
                    key={`${tag.id}-${index}`}
                    tag={tag}
                    isActive={isActive}
                    href={href}
                  />
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
