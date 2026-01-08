'use client';
import { Collection } from '@/types/collection';
import Hero from '@/components/hero';
import { useTranslations } from 'next-intl';
import { CollectionsGridContent } from './components/collections-grid-content';

interface CollectionsGridClientProps {
	collections: Collection[];
}

export default function CollectionsGridClient({ collections }: CollectionsGridClientProps) {
	const t = useTranslations('common');

	return (
		<Hero
			badgeText={t('COLLECTION')}
			title={
				<span className="bg-linear-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
					{t('EXPLORE_BY_COLLECTIONS')}
				</span>
			}
			description={t('COLLECTIONS_DESCRIPTION')}
			className="text-center flex flex-col"
		>
			<CollectionsGridContent collections={collections} />
		</Hero>
	);
}
