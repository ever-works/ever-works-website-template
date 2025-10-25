'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SurveyFormNoSSR } from '../forms/survey-form-no-ssr';
import { Survey } from '@/lib/db/schema';
import { useTranslations } from 'next-intl';
import { PreviewWarningBanner } from './PreviewWarningBanner';


interface SurveyPreviewClientProps {
	survey: Survey;
	backLink: string;
}

export function SurveyPreviewClient({ survey, backLink }: SurveyPreviewClientProps) {
	const t = useTranslations('survey');
	
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-6">
				<Link
					href={backLink}
					className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
				>
					<ArrowLeft className="w-4 h-4" />
					{t('BACK_TO_SURVEYS')}
				</Link>
			</div>

			<div className="mb-6">
				<PreviewWarningBanner />
			</div>

			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
				{survey.description && <p className="text-gray-600 dark:text-gray-400">{survey.description}</p>}
			</div>

		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
			<SurveyFormNoSSR
				surveyJson={survey.surveyJson}
				mode="display"
				className="survey-preview"
			/>
		</div>
		</div>
	);
}

