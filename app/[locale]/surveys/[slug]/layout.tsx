import { Metadata } from 'next';
import { surveyService } from '@/lib/services/survey.service';
import { Container } from '@/components/ui/container';
import { notFound } from 'next/navigation';

interface SurveyLayoutProps {
	params: Promise<{
		locale: string;
		slug: string;
	}>;
}

export async function generateMetadata({ params }: SurveyLayoutProps): Promise<Metadata> {
	const { slug } = await params;
	const survey = await surveyService.getBySlug(slug);

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

export default async function SurveyLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {

	const { slug } = await params;
	const survey = await surveyService.getBySlug(slug);

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