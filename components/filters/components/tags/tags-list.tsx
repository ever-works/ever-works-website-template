import { Button, cn } from "@heroui/react";
import { Link } from "@/i18n/navigation";
import { Tag } from "@/lib/content";
import { TagItem } from "./tag-item";
import { getButtonVariantStyles } from "../../utils/style-utils";
import { expandVisibleTagsWithSelected, orderTagsWithSelectedFirst } from "../../utils/tag-utils";
import { formatDisplayName } from "../../utils/text-utils";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { usePortal } from "@/hooks/use-portal";
import { useTranslations } from "next-intl";
import clsx from "clsx";

// Style constants for scroll container (similar to home-two-categories)
const SCROLL_CONTAINER_STYLES = clsx(
  "relative flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth",
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
);

const SCROLL_FADE_LEFT = clsx(
  "absolute left-0 top-0 bottom-2 w-12 pointer-events-none z-5",
  "bg-linear-to-r from-white via-white/80 to-transparent",
  "dark:from-gray-900 dark:via-gray-900/80",
  "opacity-0 transition-opacity duration-300"
);

const SCROLL_FADE_RIGHT = clsx(
  "absolute right-0 top-0 bottom-2 w-16 pointer-events-none z-5",
  "bg-linear-to-l from-white via-white/80 to-transparent",
  "dark:from-gray-900 dark:via-gray-900/80",
  "opacity-0 transition-opacity duration-300"
);

// Sticky left styles for "All Tags" button (similar to home-two-categories)
const STICKY_LEFT_STYLES = clsx(
  "sticky left-0 shrink-0 z-10 pr-4",
  "bg-linear-to-r from-white via-white to-transparent",
  "dark:from-gray-900 dark:via-gray-900"
);

interface TagsListProps {
  tags: Tag[];
  basePath?: string;
  resetPath?: string;
  showAllTags: boolean;
  visibleTags: Tag[];
  isAnyTagActive: boolean;
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  allItemsCount?: number;
}

/**
 * Tags list component
 * Renders a list of tag items with "All Tags" option
 * Features scroll fade indicators and "+N more" popover for hidden tags
 */
export function TagsList({
  tags,
  basePath,
  resetPath,
  showAllTags,
  visibleTags,
  isAnyTagActive,
  selectedTags = [],
  setSelectedTags,
  allItemsCount,
}: TagsListProps) {
  const t = useTranslations("listing");
  const tCommon = useTranslations("common");
  
  // State for scroll indicators and hidden tags
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hiddenTags, setHiddenTags] = useState<Tag[]>([]);
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  
  // Refs for scroll container and tag elements
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<(HTMLDivElement | null)[]>([]);
  const morePopoverRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const rafId = useRef<number | null>(null);
  const portalTarget = usePortal('tag-popover-portal');
  
  // 'All Tags' is active when no tags are selected
  const isAllTagsActive = setSelectedTags ? selectedTags.length === 0 : !isAnyTagActive;

  // Handle tag click for filter mode
  const handleTagClick = useCallback((tagId: string) => {
    if (!setSelectedTags) return;
    // If All Tags is active, selecting any tag should only select that tag
    if (selectedTags.length === 0) {
      setSelectedTags([tagId]);
      return;
    }
    if (selectedTags.includes(tagId)) {
      // Remove tag from selection
      const newTags = selectedTags.filter((id) => id !== tagId);
      setSelectedTags(newTags);
    } else {
      // Add tag to selection
      setSelectedTags([...selectedTags, tagId]);
    }
  }, [setSelectedTags, selectedTags]);

  // In filter mode, ensure all selected tags are visible and order them properly
  // Memoize to prevent infinite re-renders
  const orderedVisibleTags = useMemo(() => {
    if (setSelectedTags) {
      const expandedVisibleTags = expandVisibleTagsWithSelected(visibleTags, tags, selectedTags);
      return orderTagsWithSelectedFirst(expandedVisibleTags, selectedTags);
    }
    return visibleTags;
  }, [visibleTags, tags, selectedTags, setSelectedTags]);

  // Update scroll indicators
  const updateScrollIndicators = useCallback(() => {
    if (scrollContainerRef.current && !showAllTags) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, [showAllTags]);

  // Detect hidden tags based on visibility in the container
  const detectHiddenTags = useCallback(() => {
    if (scrollContainerRef.current && !showAllTags) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const visibilityThreshold = 30;

      const hidden: Tag[] = [];

      orderedVisibleTags.forEach((tag, index) => {
        const el = tagsRef.current[index];
        if (el) {
          const rect = el.getBoundingClientRect();

          // Check if element is visible within container bounds with threshold
          const isVisible =
            rect.left >= containerRect.left - visibilityThreshold &&
            rect.right <= containerRect.right + visibilityThreshold;

          if (!isVisible) {
            hidden.push(tag);
          }
        }
      });

      setHiddenTags(hidden);
      updateScrollIndicators();
    }
  }, [orderedVisibleTags, showAllTags, updateScrollIndicators]);

  // Initialize and update scroll indicators + hidden tags detection
  useEffect(() => {
    if (showAllTags) return; // Skip in expanded mode
    
    // Use requestAnimationFrame to ensure DOM is ready for initial detection
    const initRafId = requestAnimationFrame(() => {
      updateScrollIndicators();
      detectHiddenTags();
    });
    
    const container = scrollContainerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        updateScrollIndicators();
        detectHiddenTags();
      });
      resizeObserver.observe(container);
    }
    
    return () => {
      cancelAnimationFrame(initRafId);
      resizeObserver?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllTags, tags.length]);

  // Reset hidden tags when toggling between collapsed/expanded views
  useEffect(() => {
    setHiddenTags([]);
    setCanScrollLeft(false);
    setCanScrollRight(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllTags]);

  // Handle click outside to close popover with deferred listener pattern
  // This prevents the opening click from triggering the close handler
  useEffect(() => {
    if (!isMorePopoverOpen) return;

    const handleClickOutside = (event: PointerEvent) => {
      if (
        morePopoverRef.current &&
        !morePopoverRef.current.contains(event.target as Node) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(event.target as Node)
      ) {
        setIsMorePopoverOpen(false);
      }
    };

    // Defer listener attachment to next tick to prevent opening click from triggering close
    const timeoutId = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside, { capture: true });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', handleClickOutside, { capture: true });
    };
  }, [isMorePopoverOpen]);

  // Calculate popover position when opened and on scroll/resize
  useEffect(() => {
    if (!isMorePopoverOpen || !triggerButtonRef.current) return;

    const updatePosition = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        if (triggerButtonRef.current) {
          const rect = triggerButtonRef.current.getBoundingClientRect();
          setPopoverPosition({
            top: rect.bottom + 8,
            left: Math.max(8, rect.right - 256), // 256px = w-64, ensure it doesn't go off-screen
          });
        }
      });
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isMorePopoverOpen]);

  // Render a single tag (button for filter, link for navigation)
  const renderTag = useCallback((tag: Tag, index: number, inPopover = false) => {
    const tagBasePath = basePath
      ? `${basePath}/${tag.id}`
      : `/tags/${tag.id}`;

    const isActive = setSelectedTags
      ? selectedTags.includes(tag.id)
      : false;

    if (setSelectedTags) {
      // Filter mode (multi-select)
      return (
        <Button
          key={tag.id || index}
          variant={isActive ? "solid" : "bordered"}
          radius="full"
          size="sm"
          className={getButtonVariantStyles(
            isActive,
            cn(
              "px-1.5 py-1 h-8 font-medium transition-all duration-200 shrink-0 overflow-hidden whitespace-nowrap",
              inPopover ? "w-full justify-start" : "min-w-0 max-w-[140px]"
            )
          )}
          onClick={() => {
            handleTagClick(tag.id);
            if (inPopover) setIsMorePopoverOpen(false);
          }}
        >
          {isActive && (
            <svg
              className="w-3 h-3 mr-1.5 text-white shrink-0"
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
              src={tag.icon_url}
              width={16}
              height={16}
              className={cn(
                "w-4 h-4 mr-1.5 transition-transform shrink-0",
                isActive ? "brightness-200" : ""
              )}
              alt={tag.name}
            />
          )}
          <span
            className={cn(
              "text-sm font-medium transition-all duration-300 truncate",
              isActive
                ? "text-white tracking-wide"
                : "text-gray-700 dark:text-gray-300 group-hover:text-theme-primary dark:group-hover:text-theme-primary"
            )}
          >
            {formatDisplayName(tag.name)}
          </span>
          {typeof tag.count === 'number' && (
            <span
              className={cn(
                "ml-1.5 text-xs font-normal shrink-0",
                isActive ? "text-white" : "text-dark-500 dark:text-dark-400"
              )}
            >
              ({tag.count})
            </span>
          )}
        </Button>
      );
    }

    // Navigation mode (single select, highlight if selected)
    return (
      <TagItem
        key={tag.id || index}
        tag={tag}
        isActive={isActive}
        href={tagBasePath}
        showCount={true}
      />
    );
  }, [basePath, setSelectedTags, selectedTags, handleTagClick]);

  // Handle scroll and track hidden tags
  const handleScroll = useCallback(() => {
    detectHiddenTags();
  }, [detectHiddenTags]);

  return (
    <div className="relative">
      {!showAllTags && (
        <div className="relative">
          {/* Scroll fade indicators */}
          {canScrollLeft && (
            <div
              className={SCROLL_FADE_LEFT}
              style={{ opacity: 1 }}
              aria-hidden="true"
            />
          )}
          {canScrollRight && (
            <div
              className={SCROLL_FADE_RIGHT}
              style={{ opacity: 1 }}
              aria-hidden="true"
            />
          )}
          
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={SCROLL_CONTAINER_STYLES}
            role="region"
            aria-label="Tags filter"
          >
            {/* All Tags Button - Sticky */}
            <div className={STICKY_LEFT_STYLES}>
              {setSelectedTags ? (
                <Button
                  variant={isAllTagsActive ? "solid" : "bordered"}
                  radius="full"
                  size="sm"
                  className={getButtonVariantStyles(
                    isAllTagsActive,
                    "px-3 py-1 h-8 font-medium transition-all duration-300 shrink-0 group capitalize"
                  )}
                  onClick={() => setSelectedTags([])}
                >
                  {isAllTagsActive && (
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
                  <span className="whitespace-nowrap">All Tags</span>
                  <span
                    className={cn(
                      "ml-1.5 text-xs font-normal",
                      isAllTagsActive
                        ? "text-white"
                        : "text-dark-500 dark:text-dark-400"
                    )}
                  >
                    ({allItemsCount ?? tags.length})
                  </span>
                </Button>
              ) : (
                <Button
                  variant={isAllTagsActive ? "solid" : "bordered"}
                  radius="full"
                  size="sm"
                  as={Link}
                  prefetch={false}
                  href={resetPath || basePath || "/"}
                  className={getButtonVariantStyles(
                    isAllTagsActive,
                    "px-3 py-1 h-8 font-medium transition-all duration-300 shrink-0 group capitalize"
                  )}
                >
                  {isAllTagsActive && (
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
                  <span className="whitespace-nowrap">All Tags</span>
                  <span
                    className={cn(
                      "ml-1.5 text-xs font-normal",
                      isAllTagsActive
                        ? "text-white"
                        : "text-dark-500 dark:text-dark-400"
                    )}
                  >
                    ({allItemsCount ?? tags.length})
                  </span>
                </Button>
              )}
            </div>
            
            {/* Tag buttons */}
            {orderedVisibleTags.map((tag, idx) => (
              <div 
                key={tag.id || idx} 
                ref={(el) => { tagsRef.current[idx] = el; }}
                className="shrink-0"
              >
                {renderTag(tag, idx)}
              </div>
            ))}
            
            {/* "+N more" button - sticky at right */}
            {hiddenTags.length > 0 && (
              <div className="sticky right-0 shrink-0 pl-1 bg-linear-to-l from-white via-white/90 to-transparent dark:from-gray-900 dark:via-gray-900/90">
                <Button
                  ref={triggerButtonRef}
                  className="h-8 py-1.5 px-3 text-xs flex items-center gap-1.5 bg-theme-primary-10 hover:bg-theme-primary-20 dark:bg-theme-primary-10 dark:hover:bg-theme-primary-20 text-theme-primary-700 dark:text-theme-primary-300 border border-theme-primary-200 dark:border-theme-primary-800 shadow-xs hover:shadow-sm transition-all rounded-full"
                  onPress={() => setIsMorePopoverOpen(!isMorePopoverOpen)}
                  aria-label={`Show ${hiddenTags.length} more ${hiddenTags.length === 1 ? 'tag' : 'tags'}`}
                >
                  <span className="font-medium">
                    +{hiddenTags.length}
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
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      isMorePopoverOpen && "rotate-180"
                    )}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Button>
              </div>
            )}
          </div>
          
          {/* Popover Content - Portal Rendered */}
          {isMorePopoverOpen && hiddenTags.length > 0 && portalTarget && ReactDOM.createPortal(
            <div
              ref={morePopoverRef}
              className="fixed w-64 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 z-50"
              style={{
                top: `${popoverPosition.top}px`,
                left: `${popoverPosition.left}px`,
              }}
            >
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-1.5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5 uppercase">
                  {tCommon("MORE")} Tags
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded-sm px-1.5 py-0.5">
                    {hiddenTags.length}
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto w-full pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {hiddenTags.map((tag, idx) => renderTag(tag, idx, true))}
                </div>
              </div>
            </div>,
            portalTarget
          )}
        </div>
      )}

      {showAllTags && (
        <div className="w-full flex flex-wrap gap-2">
          {/* All Tags Button */}
          {setSelectedTags ? (
            <Button
              variant={isAllTagsActive ? "solid" : "bordered"}
              radius="full"
              size="sm"
              className={getButtonVariantStyles(
                isAllTagsActive,
                "px-3 py-1 h-8 font-medium transition-all duration-200"
              )}
              onClick={() => setSelectedTags([])}
            >
              {isAllTagsActive && (
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
                  isAllTagsActive
                    ? "text-white"
                    : "text-dark-500 dark:text-dark-400"
                )}
              >
                ({allItemsCount ?? tags.length})
              </span>
            </Button>
          ) : (
            <Button
              variant={isAllTagsActive ? "solid" : "bordered"}
              radius="full"
              size="sm"
              as={Link}
              prefetch={false}
              href={resetPath || basePath || "/"}
              className={getButtonVariantStyles(
                isAllTagsActive,
                "px-3 py-1 h-8 font-medium transition-all duration-200"
              )}
            >
              {isAllTagsActive && (
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
                  isAllTagsActive
                    ? "text-white"
                    : "text-dark-500 dark:text-dark-400"
                )}
              >
                ({allItemsCount ?? tags.length})
              </span>
            </Button>
          )}
          {/* All Tags */}
          {orderedVisibleTags.map((tag, idx) => renderTag(tag, idx))}
        </div>
      )}
    </div>
  );
} 