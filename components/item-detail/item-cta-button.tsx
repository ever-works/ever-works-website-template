'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import { SurveyStatusEnum } from '@/lib/types/survey';
import type { SurveyItem } from '@/lib/db/schema';
import { Logger } from '@/lib/logger';
import { toast } from 'sonner';

// Dynamic import to avoid survey-react-ui SSR issues with Next.js 16
const SurveyDialog = dynamic(
	() => import('@/components/surveys/survey-dialog').then((mod) => mod.SurveyDialog),
	{ ssr: false }
);

const logger = Logger.create('ItemCTAButton');

interface ItemCTAButtonProps {
	action?: 'visit-website' | 'start-survey' | 'buy';
	sourceUrl?: string;
	itemSlug?: string;
}

export function ItemCTAButton({ action = 'visit-website', sourceUrl, itemSlug }: ItemCTAButtonProps) {
	const t = useTranslations('common');
	const tSurvey = useTranslations('survey');
	const [firstSurvey, setFirstSurvey] = useState<SurveyItem | null>(null);
	const [loading, setLoading] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	const loadFirstSurvey = useCallback(async () => {
		if (!itemSlug) return;
		
		setLoading(true);
		try {
			const result = await surveyApiClient.getMany({
				itemId: itemSlug,
				status: SurveyStatusEnum.PUBLISHED
			});
			if (result.surveys && result.surveys.length > 0) {
				setFirstSurvey(result.surveys[0]);
			}
		} catch (err) {
			logger.error('Error loading first survey', err);
			toast.error(tSurvey('FAILED_TO_LOAD_SURVEYS'));
		} finally {
			setLoading(false);
		}
	}, [itemSlug, tSurvey]);

	// Load first survey when action is 'start-survey'
	useEffect(() => {
		if (action === 'start-survey' && itemSlug) {
			loadFirstSurvey();
		}
	}, [action, itemSlug, loadFirstSurvey]);

	const handleStartSurvey = () => {
		if (firstSurvey) {
			setDialogOpen(true);
		} else {
			toast.error(tSurvey('NO_SURVEYS_FOUND_FOR_ITEM'));
		}
	};

	const handleSurveyCompleted = () => {
		setDialogOpen(false);
		toast.success(tSurvey('SURVEY_SUBMITTED_SUCCESSFULLY'));
	};

	// Render based on action type
	if (action === 'start-survey') {
		return (
			<>
				<button
					onClick={handleStartSurvey}
					disabled={loading || !firstSurvey}
					className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 dark:from-theme-primary-700 dark:to-theme-primary-800 dark:hover:from-theme-primary-800 dark:hover:to-theme-primary-900 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-theme-primary-500/25 transform hover:-translate-y-0.5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
					<span className="mr-2 text-lg">📋</span>
					<span className="relative">
						{loading ? t('LOADING') + '...' : tSurvey('TAKE_SURVEY')}
					</span>
				</button>
				{firstSurvey && (
					<SurveyDialog
						survey={firstSurvey}
						open={dialogOpen}
						onClose={() => setDialogOpen(false)}
						itemSlug={itemSlug || ''}
						onCompleted={handleSurveyCompleted}
					/>
				)}
			</>
		);
	}

	if (action === 'buy') {
		return (
			<button
				disabled
				className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg opacity-50 cursor-not-allowed"
			>
				<span className="mr-2 text-lg">🛒</span>
				<span className="relative">Buy (Coming Soon)</span>
			</button>
		);
	}

	// Default: visit-website
	return (
		<a
			target="_blank"
			href={sourceUrl || '#'}
			className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 dark:from-theme-primary-700 dark:to-theme-primary-800 dark:hover:from-theme-primary-800 dark:hover:to-theme-primary-900 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-theme-primary-500/25 transform hover:-translate-y-0.5 overflow-hidden"
		>
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
			<span className="mr-2 text-lg">🌐</span>
			<span className="relative">{t('VISIT_WEBSITE')}</span>
		</a>
	);
}

