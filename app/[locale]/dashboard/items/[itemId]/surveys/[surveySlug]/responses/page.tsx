import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { surveyService } from '@/lib/services/survey.service';
import { SurveyResponsesClient } from '@/components/surveys/responses/survey-responses-client';
import { cache } from 'react';
import { getSurveysEnabled } from '@/lib/utils/settings';

interface DashboardSurveyResponsesPageProps {
	params: Promise<{
		locale: string;
		itemId: string;
		surveySlug: string;
	}>;
}

const getSurvey = cache((slug: string) => surveyService.getBySlug(slug));

export async function generateMetadata({ params }: DashboardSurveyResponsesPageProps): Promise<Metadata> {
	const { surveySlug } = await params;
	const survey = await getSurvey(surveySlug);

	if (!survey) {
		return {
			title: 'Survey Not Found'
		};
	}

	return {
		title: `${survey.title} - Responses | Dashboard`,
		description: `View responses for ${survey.title}`
	};
}

export default async function DashboardSurveyResponsesPage({ params }: DashboardSurveyResponsesPageProps) {
	// Redirect to 404 if surveys are disabled (non-admin users)
	const surveysEnabled = getSurveysEnabled();
	if (!surveysEnabled) {
		notFound();
	}

	const { surveySlug, itemId } = await params;
	const survey = await getSurvey(surveySlug);

	if (!survey) {
		notFound();
	}

	return (
		<SurveyResponsesClient
			survey={survey}
			backLink={{
				href: `/dashboard/items/${itemId}/surveys`,
				label: 'Back to Item Surveys'
			}}
			initialFilters={{ itemId }}
		/>
	)
}

