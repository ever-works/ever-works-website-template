"use client";
import { useState, useMemo, useCallback } from "react";
import { Tag } from "@/lib/content";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import UniversalPagination from "@/components/universal-pagination";
import Hero from "@/components/hero";
import { useTranslations } from "next-intl";
import { useLayoutTheme } from "@/components/context";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

const PER_PAGE = 12;

function useInfiniteTags({ items, initialPage, perPage }: { items: Tag[]; initialPage: number; perPage: number }) {
  const { paginationType } = useLayoutTheme();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const totalPages = Math.ceil(items.length / perPage);
  const displayedItems = items.slice(0, currentPage * perPage);
  const hasMore = currentPage < totalPages && displayedItems.length < items.length;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || paginationType !== "infinite") return;
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more tags"));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, paginationType]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    error,
    loadMore,
    setCurrentPage,
    totalPages
  };
}

export default function TagsGridClient({ tags }: { tags: Tag[] }) {
  const t = useTranslations("listing");
  const { paginationType } = useLayoutTheme();
  const [page, setPage] = useState(1);

  const {
    displayedItems: loadedTags,
    hasMore,
    isLoading,
    error,
    loadMore,
    setCurrentPage,
    totalPages
  } = useInfiniteTags({ items: tags, initialPage: 1, perPage: PER_PAGE });

  const pagedTags = useMemo(() => tags.slice((page - 1) * PER_PAGE, page * PER_PAGE), [tags, page]);
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
    setCurrentPage(newPage); // for consistency if switching modes
  };

  return (
    <Hero
      badgeText={t("TAGS")}
      title={
        <span className="bg-gradient-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
          {t("TAGS", { defaultValue: "Tags" })}
        </span>
      }
      description={"Browse all tags in our directory."}
      className="min-h-screen text-center"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {tagsToShow.map((tag) => (
            <Card key={tag.id} className="flex flex-col items-center justify-center p-6">
              <CardHeader className="items-center text-center p-0 mb-3">
                <CardTitle className="text-lg font-semibold text-theme-primary">
                  #{tag.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-500 dark:text-gray-400 p-0 mb-1">
                {tag.count} items
              </CardContent>
            </Card>
          ))}
        </div>
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
              <p className="text-sm text-gray-500 dark:text-gray-400">You've reached the end</p>
            </div>
          )}
        </div>
      )}
    </Hero>
  );
} 