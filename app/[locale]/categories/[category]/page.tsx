import { fetchItems } from "@/lib/content";
import ListingCategories from "../listing-categories";
import { Suspense } from "react";

export const revalidate = 10;

/**
 * Single category route - renders homepage with category filter
 * /categories/[category] shows all items filtered by the category
 */
export default async function CategoryListing({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const { category: rawCategory, locale } = resolvedParams;
  const category = decodeURIComponent(rawCategory);

  // Fetch all items (filtering will be done client-side via FilterURLParser)
  const { categories, tags, items } = await fetchItems({ lang: locale });

  // Calculate pagination info
  const total = items.length;
  const page = 1;
  const start = 0;
  const basePath = `/categories/${category}`;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingCategories
        categories={categories}
        tags={tags}
        items={items}
        total={total}
        start={start}
        page={page}
        basePath={basePath}
      />
    </Suspense>
  );
}
