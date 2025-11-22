import { getCachedItems } from "@/lib/content";
import { paginateMeta, PER_PAGE } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingTags from "../listing-tags";
import { Suspense } from "react";
import { GridSkeleton } from "@/components/ui/skeleton";
import { getTagsEnabled } from "@/lib/utils/settings";
import { notFound } from "next/navigation";

export const revalidate = 10;
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function TagPagingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const tagsEnabled = getTagsEnabled();
  if (!tagsEnabled) {
    notFound();
  }

  const { locale } = await params
  const { start, page } = paginateMeta();
  const { tags, total } = await getCachedItems({ lang: locale });

  // Sort and paginate tags with locale-aware sorting
  const collator = new Intl.Collator(locale);
  const sortedTags = tags.slice().sort((a, b) => collator.compare(a.name, b.name));
  const paginatedTags = sortedTags.slice(start, start + PER_PAGE);

  return (
    <Suspense fallback={<GridSkeleton count={12} />}>
      <ListingTags
        total={total}
        page={page}
        basePath="/tags/paging"
        tags={paginatedTags}
      />
    </Suspense>
  );
} 