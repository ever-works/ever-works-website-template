import { fetchItems } from "@/lib/content";
import ListingTags from "./listing-tags";
import { paginateMeta, PER_PAGE } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";

export const revalidate = 10;
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function TagIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { start, page } = paginateMeta(undefined, 12);
  const { tags, total } = await fetchItems({ lang: locale });

  // Sort and paginate tags
  const sortedTags = tags.slice().sort((a, b) => a.name.localeCompare(b.name));
  const paginatedTags = sortedTags.slice(start, start + PER_PAGE);

  return (
    <ListingTags
      total={total}
      page={page}
      basePath="/tags/paging"
      tags={paginatedTags}
    />
  );
}
