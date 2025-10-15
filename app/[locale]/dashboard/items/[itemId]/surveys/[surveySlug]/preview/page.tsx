import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { surveyService } from '@/lib/services/survey.service';
import { SurveyPreviewClient } from '@/components/surveys/preview/preview-client';
import { cache } from 'react';

interface DashboardSurveyPreviewPageProps {
	params: Promise<{
		locale: string;
		itemId: string;
		surveySlug: string;
	}>;
}

const getSurvey = cache((slug: string) => surveyService.getBySlug(slug));

export async function generateMetadata({ params }: DashboardSurveyPreviewPageProps): Promise<Metadata> {
	const { surveySlug } = await params;
	const survey = await getSurvey(surveySlug);
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
	const { surveySlug, itemId } = await params;
	const survey = await getSurvey(surveySlug);

	if (!survey) {
		notFound();
	}

	return <SurveyPreviewClient survey={survey} backLink={`/dashboard/items/${itemId}/surveys`} />;
}

