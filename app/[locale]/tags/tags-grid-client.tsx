"use client";
import { useState, useMemo } from "react";
import { Tag } from "@/lib/content";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import UniversalPagination from "@/components/universal-pagination";
import Hero from "@/components/hero";
import { useTranslations } from "next-intl";

const PER_PAGE = 12;

export default function TagsGridClient({ tags }: { tags: Tag[] }) {
  const [page, setPage] = useState(1);
  const t = useTranslations("listing");

  const totalPages = useMemo(() => Math.ceil(tags.length / PER_PAGE), [tags.length]);
  const pagedTags = useMemo(() => tags.slice((page - 1) * PER_PAGE, page * PER_PAGE), [tags, page]);

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
          {pagedTags.map((tag) => (
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
      <footer className="flex items-center justify-center mt-8">
        <UniversalPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </footer>
    </Hero>
  );
} 