import { Metadata } from 'next';
import { DashboardItemSurveysClient } from '@/components/surveys/lists/item-surveys-list';

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
	const { itemId } = await params;

	return <DashboardItemSurveysClient itemId={itemId} />;
}

