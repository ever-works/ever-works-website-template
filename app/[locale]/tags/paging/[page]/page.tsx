import { fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingTags from "../../listing-tags";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsPages(locale: string) {
    const { tags } = await fetchItems({ lang: locale });
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

// Set per page to 12 for tags
const PER_PAGE = 12;

export default async function TagPagingPage({
  params,
}: {
  params: Promise<{ page: string; locale: string }>;
}) {
  const { page: pageMeta, locale } = await params;
  const rawPage = pageMeta[0] || "1";
  const { start, page } = paginateMeta(rawPage, PER_PAGE);
  const { tags } = await fetchItems({ lang: locale });

  // Sort tags (by name, or your preferred logic)
  const sortedTags = tags.slice().sort((a, b) => a.name.localeCompare(b.name));
  // PAGINATE tags here!
  const paginatedTags = sortedTags.slice(start, start + PER_PAGE);

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
    <ListingTags
      total={tags.length}
      page={page}
      basePath="/tags/paging"
      tags={paginatedTags} // <-- Only pass paginated tags!
    />
  );
}
