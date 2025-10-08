'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';
import './survey-form-theme.css';
import { SurveyTypeEnum, SurveyStatusEnum } from '@/lib/constants';

export interface SurveyFormProps {
	surveyJson: any;
	onComplete?: (sender: Model) => void;
	onValueChanged?: (sender: Model, options: any) => void;
	onCurrentPageChanged?: (sender: Model, options: any) => void;
	className?: string;
	data?: any;
}

export interface SurveyFormData {
	title: string;
	description?: string;
	type: SurveyTypeEnum;
	itemId?: string;
	status: SurveyStatusEnum;
	surveyJson: any;
}

type SurveyFormRef = {
	surveyModel: Model | null;
}

// Function to apply theme using SurveyJS variables
const applySurveyTheme = (survey: Model) => {
	// Get CSS variables from the document
	const root = document.documentElement;
	const computedStyle = getComputedStyle(root);
	const isDark = root.classList.contains('dark');

	// Get theme colors
	const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim() || '#3b82f6';
	const backgroundColor = isDark 
		? computedStyle.getPropertyValue('--dark-theme-900').trim() || '#1a1a1a'
		: computedStyle.getPropertyValue('--theme-background').trim() || '#ffffff';
	const surfaceColor = isDark
		? computedStyle.getPropertyValue('--dark-theme-800').trim() || '#2d2d2d'
		: computedStyle.getPropertyValue('--theme-surface').trim() || '#f8f9fa';
	const textColor = isDark
		? computedStyle.getPropertyValue('--dark-theme-50').trim() || '#f5f5f5'
		: '#1f2937';

	// Apply SurveyJS theme variables
	survey.applyTheme({
		cssVariables: {
			'--sjs-general-backcolor': backgroundColor,
			'--sjs-general-backcolor-dim': surfaceColor,
			'--sjs-general-forecolor': textColor,
			'--sjs-primary-backcolor': primaryColor,
			'--sjs-primary-forecolor': '#ffffff',
			'--sjs-general-dim-forecolor': isDark ? '#9ca3af' : '#6b7280',
			'--sjs-border-default': isDark ? '#4a4a4a' : '#e5e7eb',
		}
	});
};

export const SurveyForm = forwardRef<SurveyFormRef, SurveyFormProps>(({
	surveyJson,
	onComplete,
	onValueChanged,
	onCurrentPageChanged,
	className = '',
	data,
}, ref) => {
	const [surveyModel, setSurveyModel] = useState<Model | null>(null);

	useImperativeHandle(ref, () => ({
		surveyModel,
	}));

	useEffect(() => {
		// Create survey model
		const survey = new Model(surveyJson);

		// Apply custom theme using SurveyJS variables
		applySurveyTheme(survey);

		// Configure survey appearance
		survey.showTitle = true;
		survey.showPageTitles = true;

		// Navigation buttons
		survey.showNavigationButtons = 'bottom';
		survey.showPrevButton = true;

		// Question numbers
		survey.questionTitleLocation = 'top';
		survey.questionErrorLocation = 'bottom';

		// Responsive behavior
		survey.widthMode = 'responsive';

		// Set pre-filled data if provided
		if (data) {
			survey.data = data;
		}

		// Event handlers
		if (onComplete) {
			survey.onComplete.add(onComplete);
		}

		if (onValueChanged) {
			survey.onValueChanged.add(onValueChanged);
		}

		if (onCurrentPageChanged) {
			survey.onCurrentPageChanged.add(onCurrentPageChanged);
		}

		setSurveyModel(survey);

		return () => {
			survey.clear();
			setSurveyModel(null);
		};
	}, [surveyJson, onComplete, onValueChanged, onCurrentPageChanged, data]);

	if (!surveyModel) {
		return null;
	}

	return (
		<>
			<div className={`survey-container ${className}`}>
				<Survey model={surveyModel} />
			</div>
		</>
	);
})


SurveyForm.displayName = 'SurveyForm';

export default SurveyForm;