import { Metadata } from 'next';
import { DashboardItemSurveysClient } from '@/components/surveys/lists/item-surveys-list';

interface DashboardItemSurveysPageProps {
	params: {
		locale: string;
		itemId: string;
	};
}

export function generateMetadata(): Metadata {
	return {
		title: `Item Surveys | Dashboard`,
		description: 'Manage surveys for your listing'
	};
}

export default function DashboardItemSurveysPage({ params }: DashboardItemSurveysPageProps) {
	const { itemId } = params;

	return <DashboardItemSurveysClient itemId={itemId} />;
}

