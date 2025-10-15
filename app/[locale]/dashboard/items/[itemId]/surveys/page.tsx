import { Metadata } from 'next';
import { DashboardItemSurveysClient } from '@/components/surveys/lists/item-surveys-list';

interface DashboardItemSurveysPageProps {
	params: {
		locale: string;
		itemId: string;
	};
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: `Item Surveys | Dashboard`,
		description: 'Manage surveys for your listing'
	};
}

export default async function DashboardItemSurveysPage({ params }: DashboardItemSurveysPageProps) {
	const { itemId } =  params;

	return <DashboardItemSurveysClient itemId={itemId} />;
}

