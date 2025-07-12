"use client";
import { useState, useMemo } from "react";
import { Tag } from "@/lib/content";
import { TagsCards } from "@/components/tags-cards";
import UniversalPagination from "@/components/universal-pagination";
import Hero from "@/components/hero";
import { useTranslations } from "next-intl";
import { useLayoutTheme } from "@/components/context";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useInfiniteLoading } from "@/hooks/use-infinite-loading";

export default function TagsGridClient({ tags }: { tags: Tag[] }) {
  const t = useTranslations("listing");
  const tCommon = useTranslations("common");
  const { paginationType, itemsPerPage } = useLayoutTheme();
  const [page, setPage] = useState(1);

  const {
    displayedItems: loadedTags,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = useInfiniteLoading({ items: tags, initialPage: 1, perPage: itemsPerPage });

  // Calculate total pages for pagination
  const totalPages = Math.ceil(tags.length / itemsPerPage);

  const pagedTags = useMemo(() => tags.slice((page - 1) * itemsPerPage, page * itemsPerPage), [tags, page, itemsPerPage]);
  const tagsToShow = paginationType === "infinite" ? loadedTags : pagedTags;

  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && !isLoading && hasMore && paginationType === "infinite" && loadedTags.length > 0) {
        loadMore();
      }
    },
    threshold: 0.5,
    rootMargin: "100px",
  });

  // Sync page state for standard pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Hero
      badgeText={t("TAGS")}
      title={
        <span className="bg-gradient-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
          {t("TAGS", { defaultValue: "Tags" })}
        </span>
      }
      description={tCommon("TAGS_DESCRIPTION", { 
        defaultValue: "Browse all tags in our directory." 
      })}
      className="min-h-screen text-center"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <TagsCards tags={tagsToShow} />
      </div>
      {/* Standard Pagination */}
      {paginationType === "standard" && (
        <footer className="flex items-center justify-center mt-8">
          <UniversalPagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </footer>
      )}
      {/* Infinite Scroll Loader */}
      {paginationType === "infinite" && (
        <div className="flex flex-col items-center gap-6 mt-16 mb-12">
          {hasMore && (
            <div ref={loadMoreRef} className="w-full flex items-center justify-center py-8">
              {error ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error.message}</p>
                  <button onClick={() => loadMore()} className="text-sm text-theme-primary-500 dark:text-theme-primary-400 hover:text-theme-primary-700 dark:hover:text-theme-primary-300 transition-colors">Retry</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-theme-primary-500 dark:text-theme-primary-400">
                  {isLoading && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">Loading...</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {!hasMore && !error && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;ve reached the end</p>
            </div>
          )}
        </div>
      )}
    </Hero>
  );
} 