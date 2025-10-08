'use client';

import React, { useState } from 'react';
import { Model } from 'survey-core';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import type { Survey } from '@/lib/db/schema';
import { toast } from 'sonner';
import { SurveyFormNoSSR } from './survey-form-no-ssr';

interface SurveyFormWrapperProps {
	survey: Survey;
	itemSlug?: string;
	onCompleted?: () => void;
	className?: string;
}

/**
 * Common Survey Form Component
 * Used in both dialog and full page contexts
 */
export function SurveyFormWrapper({ 
	survey, 
	itemSlug, 
	onCompleted,
	className 
}: SurveyFormWrapperProps) {
	const [hasStarted, setHasStarted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleValueChanged = () => {
		if (!hasStarted) {
			setHasStarted(true);
		}
	};

	const handleComplete = async (sender: Model) => {
		if (isSubmitting) return;
		
		try {
			setIsSubmitting(true);
			await surveyApiClient.submitResponse({
				surveyId: survey.id,
				itemId: itemSlug,
				data: sender.data,
			});

			toast.success('Survey completed! Thank you for your feedback.');
			
			// Call the completion callback if provided
			if (onCompleted) {
				onCompleted();
			}
		} catch (error) {
			console.error('Error saving survey response:', error);
			toast.error('Failed to save survey response. Please try again.');
			setIsSubmitting(false);
		}
	};

	if (survey.status !== 'published') {
		return (
			<div className="text-center py-8">
				<h3 className="text-xl font-semibold mb-2">Survey Not Available</h3>
				<p className="text-gray-600 dark:text-gray-400">
					This survey is currently {survey.status} and not available for responses.
				</p>
			</div>
		);
	}

	return (
		<div className={className}>
			<SurveyFormNoSSR
				surveyJson={survey.surveyJson}
				onComplete={handleComplete}
				onValueChanged={handleValueChanged}
				className="survey-form"
			/>
		</div>
	);
}

