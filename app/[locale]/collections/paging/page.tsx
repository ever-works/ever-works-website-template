import { CollectionsList } from "@/components/collections";
import { getCachedItems } from "@/lib/content";
import { paginateMeta } from "@/lib/paginate";
import { MOCK_COLLECTIONS } from "@/lib/mock/collections";

export const revalidate = 10;

// Allow non-English locales to be generated on-demand (ISR)
export const dynamicParams = true;

export async function generateStaticParams() {
  // Only pre-build English locale for optimal build size
  return [{ locale: 'en' }];
}

export default async function CollectionsPagingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const COLLECTIONS_PER_PAGE = 6;
  const { start, page } = paginateMeta(1, COLLECTIONS_PER_PAGE);

  // Fetch collections from content
  const { collections } = await getCachedItems({ lang: locale });

  // Fallback to mock data if no collections.yml exists yet
  const allCollections = collections.length > 0 ? collections : MOCK_COLLECTIONS;

  // Sort and paginate collections
  const collator = new Intl.Collator(locale);
  const sortedCollections = allCollections.slice().sort((a, b) => collator.compare(a.name, b.name));
  const paginatedCollections = sortedCollections.slice(start, start + COLLECTIONS_PER_PAGE);

  return (
    <CollectionsList
      collections={paginatedCollections}
      locale={locale}
      total={allCollections.length}
      page={page}
      basePath="/collections/paging"
    />
  );
}
