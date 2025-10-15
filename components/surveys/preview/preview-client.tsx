'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { SurveyFormNoSSR } from '../forms/survey-form-no-ssr';
import { Survey } from '@/lib/db/schema';
import { Logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

const logger = Logger.create('SurveyPreviewClient');


interface SurveyPreviewClientProps {
	survey: Survey;
	backLink: string;
}

export function SurveyPreviewClient({ survey, backLink }: SurveyPreviewClientProps) {
	const t = useTranslations('common');
	
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

			<div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<div className="flex items-start gap-3">
					<AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">{t('PREVIEW_MODE')}</h3>
						<p className="text-sm text-yellow-700 dark:text-yellow-300">
							{t('PREVIEW_MODE_DESC')}
						</p>
					</div>
				</div>
			</div>

			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
				{survey.description && <p className="text-gray-600 dark:text-gray-400">{survey.description}</p>}
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<SurveyFormNoSSR
					surveyJson={survey.surveyJson}
					onComplete={(sender) => {
						logger.debug('Preview mode - response not saved', sender.data);
					}}
					className="survey-preview"
				/>
			</div>
		</div>
	);
}

