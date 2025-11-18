import { getCachedItems } from "@/lib/content";
import { LOCALES } from "@/lib/constants";
import ListingCategories from "./listing-categories";
import { Suspense } from "react";
import { ListingSkeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { getCategoriesEnabled } from "@/lib/utils/settings";

export const revalidate = 10;
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Check if categories are enabled
  const categoriesEnabled = getCategoriesEnabled();
  if (!categoriesEnabled) {
    notFound();
  }

  const { locale } = await params;
  const { categories, tags, items } = await getCachedItems({ lang: locale });

  // Calculate pagination info
  const total = items.length;
  const page = 1;
  const start = 0;
  const basePath = "/categories";

  return (
    <Suspense fallback={<ListingSkeleton />}>
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
