import { Metadata } from 'next';
import { surveyService } from '@/lib/services/survey.service';
import { Container } from '@/components/ui/container';
import { notFound } from 'next/navigation';
import { cache } from 'react';

interface SurveyLayoutProps {
	params: {
		locale: string;
		slug: string;
	};
}

const getSurvey = cache(async (slug: string) => {
	return surveyService.getBySlug(slug);
});

export async function generateMetadata({ params }: SurveyLayoutProps): Promise<Metadata> {
	const { slug } = params;
	const survey = await getSurvey(slug);

	if (!survey) {
		return {
			title: 'Survey Not Found'
		};
	}

	return {
		title: `${survey.title} | Surveys`,
		description: survey.description || 'Complete this survey'
	};
}

export default async function SurveyLayout({
	children,
	params,
}: { children: React.ReactNode; params: { locale: string; slug: string } }) {
	
	const { slug } = params;
	const survey = await getSurvey(slug);

	if (!survey) {
		return notFound();
	}

	return (
		<div className="py-8">
			<Container maxWidth="7xl" padding="default">
				{children}
			</Container>
		</div>
	);
}