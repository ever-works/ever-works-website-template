import { getCachedItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingTags from "../../listing-tags";
import { Suspense } from "react";
import { GridSkeleton } from "@/components/ui/skeleton";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsPages(locale: string) {
    const { tags } = await getCachedItems({ lang: locale });
    const paths = [];
    const pages = totalPages(tags.length);

    for (let i = 1; i <= pages; ++i) {
      paths.push({ page: i.toString(), locale });
    }

    return paths;
  }

  const params = LOCALES.map((locale) => fetchItemsPages(locale));
  return (await Promise.all(params)).flat();
}

// Set per page to 12 for tags (default from config)
const PER_PAGE = 12; // This matches the default in LayoutThemeContext

export default async function TagPagingPage({
  params,
}: {
  params: Promise<{ page: string; locale: string }>;
}) {
  const { page: pageMeta, locale } = await params;
  const rawPage = pageMeta[0] || "1";
  const { start, page } = paginateMeta(rawPage, PER_PAGE);
  const { tags } = await getCachedItems({ lang: locale, sortTags: true });

  // PAGINATE tags here!
  const paginatedTags = tags.slice(start, start + PER_PAGE);

  // Debug log
  console.log({
    page,
    start,
    perPage: PER_PAGE,
    totalTags: tags.length,
    paginatedTags: paginatedTags.length,
    paginatedTagNames: paginatedTags.map(t => t.name)
  });

  return (
    <Suspense fallback={<GridSkeleton count={12} />}>
      <ListingTags
        total={tags.length}
        page={page}
        basePath="/tags/paging"
        tags={paginatedTags} // <-- Only pass paginated tags!
      />
    </Suspense>
  );
}
