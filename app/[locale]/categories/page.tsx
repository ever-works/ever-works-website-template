import { fetchItems } from "@/lib/content";
import { paginateMeta } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingCategories from "./listing-categories";

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
  const { start, page } = paginateMeta();
  const { tags, total, items, categories } = await fetchItems({ lang: locale });

  return (
    <ListingCategories
      total={total}
      start={start}
      page={page}
      basePath="/categories/paging"
      categories={categories}
      tags={tags}
      items={items}
    />
  );
}
