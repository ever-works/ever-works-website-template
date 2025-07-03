"use client";
import { useTranslations } from "next-intl";
import Hero from "@/components/hero";
import { TagsCards } from "@/components/tags-cards";
import { Paginate } from "@/components/filters/components/pagination/paginate";
import { totalPages } from "@/lib/paginate";

export default function ListingTags({
  tags,
  total,
  page,
  basePath,
}: {
  tags: any[];
  total: number;
  page: number;
  basePath: string;
}) {
  const t = useTranslations("listing");

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
        <TagsCards tags={tags} />
      </div>
      <footer className="flex items-center justify-center">
        <Paginate
          basePath={basePath}
          initialPage={page}
          total={totalPages(total)}
        />
      </footer>
    </Hero>
  );
}
