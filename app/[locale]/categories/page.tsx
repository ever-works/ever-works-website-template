import { fetchItems } from "@/lib/content";
import { LOCALES } from "@/lib/constants";
import ListingCategories from "./listing-categories";

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
  const { categories } = await fetchItems({ lang: locale });

  return <ListingCategories categories={categories} />;
}
