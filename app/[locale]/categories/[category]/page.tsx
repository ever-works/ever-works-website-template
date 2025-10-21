import { fetchByCategory, fetchItems } from "@/lib/content";
import { paginateMeta } from "@/lib/paginate";
import Listing from "../../(listing)/listing";
import { Suspense } from "react";

export const revalidate = 10;

/**
 * Simpler category route - renders content at /categories/[category]
 * This provides a cleaner URL structure than /categories/category/[category]
 */
export default async function CategoryListing({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const { category: rawCategory, locale } = resolvedParams;
  const category = decodeURIComponent(rawCategory);

  // Default to page 1 (pagination not supported on simple route)
  const page = 1;
  const { start } = paginateMeta(page);

  const result = await fetchByCategory(category, { lang: locale });

  const { items, categories, total, tags } = result;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Listing
        total={total}
        start={start}
        page={page}
        basePath={`/categories/${category}`}
        categories={categories}
        tags={tags}
        items={items}
        initialCategory={category}
      />
    </Suspense>
  );
}
