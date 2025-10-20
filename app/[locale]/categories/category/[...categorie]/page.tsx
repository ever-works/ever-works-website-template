import { fetchByCategory, fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import Listing from "../../../(listing)/listing";
import { Suspense } from "react";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsTags(locale: string) {
    const { categories } = await fetchItems({ lang: locale });
    const paths = [];

    for (const category of categories) {
      const pages = totalPages(category.count || 0);

      for (let i = 1; i <= pages; ++i) {
        if (i === 1) {
          paths.push({ categorie: [category.id], locale });
        } else {
          paths.push({ categorie: [category.id, i.toString()], locale });
        }
      }
    }

    return paths;
  }

  const params = LOCALES.map((locale) => fetchItemsTags(locale));

  return (await Promise.all(params)).flat();
}

export default async function CategoryListing({
  params,
}: {
  params: Promise<{ categorie: string[]; locale: string }>;
}) {
  const resolvedParams = await params;
  const { categorie: categoryMeta, locale } = resolvedParams;
  const [rawCategory, rawPage] = categoryMeta;
  const category = decodeURIComponent(rawCategory);
  
  // Handle pagination
  const page = rawPage ? parseInt(rawPage) : 1;
  const { start } = paginateMeta(page);
  
  // For now, we'll use the original approach
  // In the future, we can implement query parameters here
  const result = await fetchByCategory(category, { lang: locale });

  const { items, categories, total, tags } = result;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Listing
        total={total}
        start={start}
        page={page}
        basePath={`/categories/category/${category}`}
        categories={categories}
        tags={tags}
        items={items}
        initialCategory={category}
      />
    </Suspense>
  );
}
