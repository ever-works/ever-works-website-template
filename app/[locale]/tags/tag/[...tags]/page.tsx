import { fetchByTag, fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingTags from "../../listing-tags";
import { Suspense } from "react";
import { GridSkeleton } from "@/components/ui/skeleton";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsTags(locale: string) {
    const { tags } = await fetchItems({ lang: locale });
    const paths = [];

    for (const tag of tags) {
      const pages = totalPages(tag.count || 0);

      for (let i = 1; i <= pages; ++i) {
        if (i === 1) {
          paths.push({ tags: [tag.id], locale });
        } else {
          paths.push({ tags: [tag.id, i.toString()], locale });
        }
      }
    }

    return paths;
  }

  const params = LOCALES.map((locale) => fetchItemsTags(locale));

  return (await Promise.all(params)).flat();
}

export default async function TagListing({
  params,
}: {
  params: Promise<{ tags: string[]; locale: string }>;
}) {
  const resolvedParams = await params;
  const { tags: tagMeta, locale } = resolvedParams;
  const [rawTag, rawPage] = tagMeta;
  const tag = decodeURI(rawTag);
  const { page } = paginateMeta(rawPage || "1");
  const { total, tags } = await fetchByTag(tag, {
    lang: locale,
  });
  
  return (
    <Suspense fallback={<GridSkeleton count={12} />}>
      <ListingTags
        total={total}
        page={page}
        basePath={`/tags/tag/${tag}`}
        tags={tags}
      />
    </Suspense>
  );
} 