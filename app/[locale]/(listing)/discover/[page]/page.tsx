import { getCachedItems } from "@/lib/content";
import { paginateMeta } from "@/lib/paginate";
import Listing from "../../listing";

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Pre-generate first 5 pages for main locales at build time
// Other pages and locales will be generated on-demand (ISR)
export async function generateStaticParams() {
  // Pre-build pages 1-5 for main locales (en, fr, es, de) to speed up initial load
  // This covers ~80% of user traffic based on typical usage patterns
  const mainLocales = ['en', 'es'];
  const pagesToPreBuild = 10; // First 10 pages cover most user navigation

  const params = [];
  for (const locale of mainLocales) {
    for (let page = 1; page <= pagesToPreBuild; page++) {
      params.push({ page: page.toString(), locale });
    }
  }

  return params;
}

export default async function DiscoverListing({
  params,
}: {
  params: Promise<{ page: string; locale: string }>;
}) {
  const { page: rawPage, locale } = await params;

  const { start, page } = paginateMeta(rawPage);
  const { items, categories, total, tags } = await getCachedItems({ lang: locale });

  return (
      <Listing
        tags={tags}
        categories={categories}
        items={items}
        start={start}
        page={page}
        total={total}
        basePath="/discover"
      />
  );
}
