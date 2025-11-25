import { Category, ItemData, Tag } from '@/lib/content';
import { FC, Suspense } from 'react';
import { ListingSkeleton } from '@/components/ui/skeleton';
import Listing from '@/app/[locale]/(listing)/listing';

const DiscoverListingPageContent: FC<{
	start: number;
	page: number;
	categories: Category[];
	tags: Tag[];
	items: ItemData[];
	total: number;
}> = ({ start, page, categories, tags, items, total }) => {
	return (
		<Suspense fallback={<ListingSkeleton />}>
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
};
export default DiscoverListingPageContent;