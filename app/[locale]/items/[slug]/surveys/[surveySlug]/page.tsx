import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { surveyService } from '@/lib/services/survey.service';
import { SurveyPageClient } from '@/components/surveys/pages/public-survey-page';
import { Container } from '@/components/ui/container';

interface ItemSurveyPageProps {
	params: Promise<{
		locale: string;
		slug: string;
		surveySlug: string;
	}>;
}

export async function generateMetadata({ params }: ItemSurveyPageProps): Promise<Metadata> {
	const { surveySlug } = await params;
	const survey = await surveyService.getBySlug(surveySlug);

	if (!survey) {
		return {
			title: 'Survey Not Found'
		};
	}

	return {
		title: `${survey.title} | Survey`,
		description: survey.description || `Take the ${survey.title} survey`
	};
}

export default async function ItemSurveyPage({ params }: ItemSurveyPageProps) {
	const { surveySlug, slug } = await params;

	// Fetch survey data on the server
	const survey = await surveyService.getBySlug(surveySlug);

	if (!survey) {
		notFound();
	}

	// Pass the item slug for context
	return (
		<Container className="my-8" maxWidth="7xl" padding="default">
			<SurveyPageClient survey={survey} itemSlug={slug} />
		</Container>
	);
}

