import type { ItemData } from '@/lib/content';
import Item from '../item';

interface SimilarItemsSectionProps {
	allItems: ItemData[];
	className?: string;
	title?: string;
}

export function SimilarItemsSection({ allItems, className, title = 'Similar Products' }: SimilarItemsSectionProps) {
	return (
		<section className={`${className} w-full`}>
			<div className="flex items-center gap-2 mb-6">
				<h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
				<span
					className="text-xs bg-linear-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/
                        30 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full font-semibold border border-cyan-200 
                        dark:border-cyan-700/50"
				>
					{allItems.length} result(s)
				</span>
			</div>

			<div className="grid grid-cols-1 gap-4 overflow-y-auto">
				{allItems.map((similarItem) => (
					<Item key={similarItem.slug} {...similarItem} is_source_url_active={true} hideIndicatorInSimilarProducts={true} />
				))}
			</div>
		</section>
	);
}
