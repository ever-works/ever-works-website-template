import { fetchItems } from "@/lib/content";
import { paginateMeta } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingTags from "../listing-tags";

export const revalidate = 10;
export async function generateStaticParams() {
  const params = LOCALES.map((locale) => fetchItems({ lang: locale }));
  return (await Promise.all(params)).flat();
}

export default async function TagPagingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } =await params
  const { start, page } = paginateMeta();
  const { tags, total, items, categories } = await fetchItems({ lang: locale });

  return (
      <ListingTags
        total={total}
        start={start}
        page={page}
        basePath="/tag/paging"
        categories={categories}
        tags={tags}
        items={items}
      />
  );
} 