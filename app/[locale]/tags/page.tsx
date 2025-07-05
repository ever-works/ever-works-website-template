import { fetchItems } from "@/lib/content";
import ListingTags from "./listing-tags";
import { paginateMeta } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";

export const revalidate = 10;
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function TagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { start, page } = paginateMeta();
  const { tags, total, items, categories } = await fetchItems({ lang: locale });

  return (
    <ListingTags
      total={total}
      start={start}
      page={page}
      basePath="/tags/paging"
      categories={categories}
      tags={tags}
      items={items}
    />
  );
}
