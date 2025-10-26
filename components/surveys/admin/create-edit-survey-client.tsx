'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSurveyForm, SurveyFormData } from '../forms/admin-survey-form';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import type { Survey } from '@/lib/db/schema';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveyTypeEnum } from '@/lib/types/survey';
import { Logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

const logger = Logger.create('CreateEditSurveyClient');

interface CreateEditSurveyClientProps {
	survey?: Survey;
	defaultItemId?: string;
}

export function CreateEditSurveyClient({ survey, defaultItemId }: CreateEditSurveyClientProps) {
	const router = useRouter();
	const t = useTranslations('survey');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const mode = survey?.id ? 'edit' : 'create';

	const handleSubmit = async (data: SurveyFormData) => {
		setIsSubmitting(true);
		try {
			if (survey?.id) {
				await surveyApiClient.update(survey.id, data);
			} else {
				await surveyApiClient.create(data);
			}
			toast.success(mode === 'edit' ? t('SURVEY_UPDATED_SUCCESSFULLY') : t('SURVEY_CREATED_SUCCESSFULLY'));
			router.push('/admin/surveys');
		} catch (error) {
			logger.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} survey`, error);
			toast.error(error instanceof Error ? error.message : (mode === 'edit' ? t('FAILED_TO_UPDATE_SURVEY') : t('FAILED_TO_CREATE_SURVEY')));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push('/admin/surveys');
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-6">
				<Button
					onClick={handleCancel}
					variant="ghost"
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4" />
					{t('BACK_TO_SURVEYS')}
				</Button>
				<h1 className="text-3xl font-bold mb-2">{mode === 'edit' ? t('EDIT_SURVEY') : t('CREATE_SURVEY')}</h1>
				<p className="text-gray-600 dark:text-gray-400">
					{mode === 'edit' ? t('SURVEY_UPDATED_SUCCESSFULLY') : t('CREATE_ITEM_SURVEY_DESC')}
				</p>
			</div>

		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
			<AdminSurveyForm
				mode={mode}
				survey={survey}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isLoading={isSubmitting}
				defaultType={defaultItemId ? SurveyTypeEnum.ITEM : undefined}
				defaultItemId={defaultItemId}
			/>
		</div>
		</div>
	);
}

