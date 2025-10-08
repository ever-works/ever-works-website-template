import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { surveyService } from '@/lib/services/survey.service';
import { SurveyResponsesClient } from '@/components/surveys/responses/survey-responses-client';

interface AdminSurveyResponsesPageProps {
	params: Promise<{
		locale: string;
		slug: string;
	}>;
}

export async function generateMetadata({ params }: AdminSurveyResponsesPageProps): Promise<Metadata> {
	const { slug } = await params;
	const survey = await surveyService.getBySlug(slug);

	if (!survey) {
		return {
			title: 'Survey Not Found'
		};
	}

	return {
		title: `${survey.title} - Responses | Admin`,
		description: `View responses for ${survey.title}`
	};
}

export default async function AdminSurveyResponsesPage({ params }: AdminSurveyResponsesPageProps) {
	const { slug } = await params;
	const survey = await surveyService.getBySlug(slug);

	if (!survey) {
		notFound();
	}

	return (
		<SurveyResponsesClient
			survey={survey}
			backLink={{
				href: '/admin/surveys',
				label: 'Back to Surveys'
			}}
		/>
	);
}

