import { fetchItems } from "@/lib/content";
import { paginateMeta } from "@/lib/paginate";
import Listing from "../../listing";
import { Suspense } from "react";

// Disable static generation to prevent content loading errors during build
export const dynamic = 'force-dynamic';

// Remove generateStaticParams to prevent build-time content loading
// export async function generateStaticParams() {
//   async function fetchItemsPages(locale: string) {
//     const { items } = await fetchItems({ lang: locale });
//     const paths = [];
//     const pages = totalPages(items.length);

//     for (let i = 1; i <= pages; ++i) {
//       paths.push({ page: i.toString(), locale });
//     }

//     return paths;
//   }

//   const params = LOCALES.map((locale) => fetchItemsPages(locale));

//   return (await Promise.all(params)).flat();
// }

export default async function DiscoverListing({
  params,
}: {
  params: Promise<{ page: string; locale: string }>;
}) {
  const { page: rawPage, locale } = await params;

  const { start, page } = paginateMeta(rawPage);
  const { items, categories, total, tags } = await fetchItems({ lang: locale });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Listing
        tags={tags}
        categories={categories}
        items={items}
        start={start}
        page={page}
        total={total}
        basePath="/discover"
      />
    </Suspense>
  );
}
