import { getCachedItems } from "@/lib/content";
import { MOCK_COLLECTIONS } from "@/lib/mock/collections";
import CollectionsGridClient from "./collections-grid-client";

export const revalidate = 10;

// Allow non-English locales to be generated on-demand (ISR)
export const dynamicParams = true;

export async function generateStaticParams() {
  // Only pre-build English locale for optimal build size
  return [{ locale: 'en' }];
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch collections from content
  const { collections } = await getCachedItems({ lang: locale });

  // Fallback to mock data if no collections.yml exists yet
  const collectionsData = collections.length > 0 ? collections : MOCK_COLLECTIONS;

  return <CollectionsGridClient collections={collectionsData} locale={locale} />;
}
