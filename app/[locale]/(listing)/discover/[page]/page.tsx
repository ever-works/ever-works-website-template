import { getCachedItems } from '@/lib/content';
import { paginateMeta } from '@/lib/paginate';
import DiscoverListingPageContent from '@/components/pages/discover';

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

export default async function DiscoverListing({ params }: { params: Promise<{ page: string; locale: string }> }) {
	const { page: rawPage, locale } = await params;

	const { start, page } = paginateMeta(rawPage);
	const { items, categories, total, tags } = await getCachedItems({ lang: locale });

	return (
		<DiscoverListingPageContent
			start={start}
			page={page}
			categories={categories}
			tags={tags}
			items={items}
			total={total}
		/>
	);
}
