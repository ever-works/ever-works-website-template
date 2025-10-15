'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { SurveyFormNoSSR } from './survey-form-no-ssr';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Model } from 'survey-core';

interface SurveyPreviewDialogProps {
	surveyJson: Model | object;
	title?: string;
	isOpen: boolean;
	onClose: () => void;
}

export function SurveyPreviewDialog({
	surveyJson,
	title,
	isOpen,
	onClose
}: SurveyPreviewDialogProps) {
	const t = useTranslations('common');

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			className="max-w-4xl max-h-[90vh] flex flex-col"
			title={title || t('SURVEY_PREVIEW')}
			subtitle={<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('PREVIEW_MODE_USER_DESC')}</p>}
		>

			<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
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

			<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
				<SurveyFormNoSSR
					surveyJson={surveyJson}
					onComplete={() => {
						// Preview mode - no action needed
					}}
					className="survey-preview"
				/>
			</div>

		</Modal>
	);
}

