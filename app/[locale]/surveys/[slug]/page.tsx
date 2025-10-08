import { SurveyPageClient } from '@/components/surveys/pages/public-survey-page';
import { surveyService } from '@/lib/services/survey.service';
import { notFound } from 'next/navigation';

interface SurveyPageProps {
	params: Promise<{
		locale: string;
		slug: string;
	}>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
	const { slug } = await params;

	// Fetch survey data on the server
	const survey = await surveyService.getBySlug(slug);

	if (!survey) {
		notFound();
	}

	return <SurveyPageClient survey={survey} />;
}

