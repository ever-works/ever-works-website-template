import { fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { Listing } from "../../listing";
import { LOCALES } from "@/lib/constants";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsPages(locale: string) {
    const { items } = await fetchItems({ lang: locale });
    const paths = [];
    const pages = totalPages(items.length);

    for (let i = 1; i <= pages; ++i) {
      paths.push({ page: i.toString(), locale });
    }

    return paths;
  }

  const params = LOCALES.map((locale) => fetchItemsPages(locale));

  return (await Promise.all(params)).flat();
}

export default async function DiscoverListing({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const rawPage = (await params).page;
  const { start, page } = paginateMeta(rawPage);
  const { items, categories, total, tags } = await fetchItems();

  return (
    <Listing
      tags={tags}
      categories={categories}
      items={items}
      start={start}
      page={page}
      total={total}
      basePath="/discover"
    />
  );
}
