import { fetchByCategory, fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { Listing } from "../../listing";
import { LOCALES } from "@/lib/constants";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsCategories(locale: string) {
    const { categories } = await fetchItems({ lang: locale });
    const paths = [];

    for (const category of categories) {
      const pages = totalPages(category.count || 0);

      for (let i = 1; i <= pages; ++i) {
        if (i === 1) {
          paths.push({ category: [category.id], locale });
        } else {
          paths.push({ category: [category.id, i.toString()], locale });
        }
      }
    }

    return paths;
  }

  const params = LOCALES.map((locale) => fetchItemsCategories(locale));

  return (await Promise.all(params)).flat();
}

export default async function CategoryListing({
  params,
}: {
  params: Promise<{ category: string[] }>;
}) {
  const cat = (await params).category;
  const category = decodeURI(cat[0]);
  const { start, page } = paginateMeta(cat[1]);
  const { items, categories, total, tags } = await fetchByCategory(category);

  return (
    <Listing
      categories={categories}
      tags={tags}
      items={items}
      start={start}
      page={page}
      total={total}
      basePath={`/categories/${category}`}
    />
  );
}
