import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SurveyPreviewClient } from '@/components/surveys/preview/preview-client';
import { surveyService } from '@/lib/services/survey.service';

interface AdminSurveyPreviewPageProps {
	params: Promise<{
		locale: string;
		slug: string;
	}>;
}

export async function generateMetadata({ params }: AdminSurveyPreviewPageProps): Promise<Metadata> {
	const { slug } = await params;
	const survey = await surveyService.getBySlug(slug);

	if (!survey) {
		return {
			title: 'Survey Not Found'
		};
	}

	return {
		title: `${survey.title} - Preview | Admin`,
		description: `Preview ${survey.title}`
	};
}

export default async function AdminSurveyPreviewPage({ params }: AdminSurveyPreviewPageProps) {
	const { slug } = await params;
	const survey = await surveyService.getBySlug(slug);

	if (!survey) {
		notFound();
	}

	return <SurveyPreviewClient survey={survey} backLink="/admin/surveys" />;
}

