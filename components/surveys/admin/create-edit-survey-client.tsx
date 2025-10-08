'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSurveyForm, SurveyFormData } from '../forms/admin-survey-form';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import type { Survey } from '@/lib/db/schema';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateEditSurveyClientProps {
	survey?: Survey;
}

export function CreateEditSurveyClient({ survey }: CreateEditSurveyClientProps) {
	const router = useRouter();
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
			toast.success('Survey updated successfully!');
			router.push('/admin/surveys');
		} catch (error) {
			console.error('Error updating survey:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to update survey');
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
					Back to Surveys
				</Button>
				<h1 className="text-3xl font-bold mb-2">{mode === 'edit' ? 'Edit Survey' : 'Create Survey'}</h1>
				<p className="text-gray-600 dark:text-gray-400">
					{mode === 'edit' ? 'Update survey details and configuration' : 'Create a new survey for collecting user feedback'}
				</p>
			</div>

		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
			<AdminSurveyForm
				mode={mode}
				survey={survey}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isLoading={isSubmitting}
			/>
		</div>
		</div>
	);
}

