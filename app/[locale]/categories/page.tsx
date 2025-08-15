import { fetchItems } from "@/lib/content";
import { LOCALES } from "@/lib/constants";
import ListingCategories from "./listing-categories";
import { Suspense } from "react";

export const revalidate = 10;
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { categories, tags, items } = await fetchItems({ lang: locale });

  // Calculate pagination info
  const total = items.length;
  const page = 1;
  const start = 0;
  const basePath = "/categories";

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
