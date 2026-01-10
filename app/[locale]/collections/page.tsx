import { getCachedItems } from '@/lib/content';
import CollectionsGridClient from './collections-grid-client';

// Always fetch fresh collections so public page updates immediately after admin changes
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Allow non-English locales to be generated on-demand (ISR)
export const dynamicParams = true;

export async function generateStaticParams() {
	// Only pre-build English locale for optimal build size
	return [{ locale: 'en' }];
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;

	// Fetch collections from YAML content
	const { collections } = await getCachedItems({ lang: locale });

	// Only show active collections publicly
	const activeCollections = collections.filter((c) => c.isActive !== false);

	return <CollectionsGridClient collections={activeCollections} />;
}
