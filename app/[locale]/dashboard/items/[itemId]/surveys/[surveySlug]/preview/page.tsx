import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { surveyService } from '@/lib/services/survey.service';
import { SurveyPreviewClient } from '@/components/surveys/preview/preview-client';

interface DashboardSurveyPreviewPageProps {
	params: {
		locale: string;
		itemId: string;
		surveySlug: string;
	};
}

export async function generateMetadata({ params }: DashboardSurveyPreviewPageProps): Promise<Metadata> {
	const { surveySlug } =  params;
	const survey = await surveyService.getBySlug(surveySlug);

	if (!survey) {
		return {
			title: 'Survey Not Found'
		};
	}

	return {
		title: `${survey.title} - Preview | Dashboard`,
		description: `Preview ${survey.title}`
	};
}

export default async function DashboardSurveyPreviewPage({ params }: DashboardSurveyPreviewPageProps) {
	const { surveySlug, itemId } =  params;
	const survey = await surveyService.getBySlug(surveySlug);

	if (!survey) {
		notFound();
	}

	return <SurveyPreviewClient survey={survey} backLink={`/dashboard/items/${itemId}/surveys`} />;
}

