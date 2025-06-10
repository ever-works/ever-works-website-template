import { fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingCategories from "../../listing-categories";

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

export default async function CategoryPagingPage({
  params,
}: {
  params: Promise<{ page: string; locale: string }>;
}) {
  const { page: pageMeta, locale } = await params;
  const rawPage = pageMeta[0] || "1";
  const { start, page } = paginateMeta(rawPage);
  const { items, categories, total, tags } = await fetchItems({ lang: locale });

  return (
    <ListingCategories
        total={total}
        start={start}
        page={page}
        basePath="/categorie/paging"
        categories={categories}
        tags={tags}
        items={items}
      />
  );
}
