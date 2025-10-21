import { fetchByTag } from "@/lib/content";
import { paginateMeta } from "@/lib/paginate";
import ListingTags from "../listing-tags";
import { Suspense } from "react";

export const revalidate = 10;

/**
 * Simpler tag route - renders content at /tags/[tag]
 * This provides a cleaner URL structure than /tags/tag/[tag]
 */
export default async function TagListing({
  params,
}: {
  params: Promise<{ tag: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const { tag: rawTag, locale } = resolvedParams;
  const tag = decodeURI(rawTag);

  // Default to page 1 (pagination not supported on simple route)
  const { page } = paginateMeta("1");

  const { total, tags } = await fetchByTag(tag, {
    lang: locale,
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingTags
        total={total}
        page={page}
        basePath={`/tags/${tag}`}
        tags={tags}
      />
    </Suspense>
  );
}
