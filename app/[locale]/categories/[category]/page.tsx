import { redirect } from "next/navigation";

export const revalidate = 10;

/**
 * Simpler category route - redirects to homepage with category filter
 * /categories/[category] → /?categories=[category]
 */
export default async function CategoryListing({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const { category: rawCategory, locale } = resolvedParams;
  const category = decodeURIComponent(rawCategory);

  // Redirect to homepage with category filter applied
  const localePrefix = locale ? `/${locale}` : '';
  redirect(`${localePrefix}/?categories=${encodeURIComponent(category)}`);
}
