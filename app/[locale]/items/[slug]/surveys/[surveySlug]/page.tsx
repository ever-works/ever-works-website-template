import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { surveyService } from '@/lib/services/survey.service';
import { SurveyPageClient } from '@/components/surveys/pages/public-survey-page';
import { Container } from '@/components/ui/container';
import { cache } from 'react';

interface ItemSurveyPageProps {
	params: Promise<{
		locale: string;
		slug: string;
		surveySlug: string;
	}>;
}

const getSurvey = cache((slug: string) => surveyService.getBySlug(slug));


export async function generateMetadata({ params }: ItemSurveyPageProps): Promise<Metadata> {
	const { surveySlug } = await params;
	const survey = await getSurvey(surveySlug);

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
	const survey = await getSurvey(surveySlug);

	if (!survey) {
		notFound();
	}

	// Pass the item slug for context
	return (
		<Container className="my-8" maxWidth="7xl" padding="default">
			<p>Helo</p>
			{/* <SurveyPageClient survey={survey} itemSlug={slug} /> */}
		</Container>
	);
}

