import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardItemSurveysClient } from '@/components/surveys/lists/item-surveys-list';
import { getSurveysEnabled } from '@/lib/utils/settings';

interface DashboardItemSurveysPageProps {
	params: Promise<{
		locale: string;
		itemId: string;
	}>;
}

export function generateMetadata(): Metadata {
	return {
		title: `Item Surveys | Dashboard`,
		description: 'Manage surveys for your listing'
	};
}

export default async function DashboardItemSurveysPage({ params }: DashboardItemSurveysPageProps) {
	// Redirect to 404 if surveys are disabled (non-admin users)
	const surveysEnabled = getSurveysEnabled();
	if (!surveysEnabled) {
		notFound();
	}

	const { itemId } = await params;

	return <DashboardItemSurveysClient itemId={itemId} />;
}

