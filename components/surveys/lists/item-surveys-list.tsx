'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import type { Survey } from '@/lib/db/schema';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { SurveysListClient } from './surveys-list-client';
import { SurveyTypeEnum } from '@/lib/constants';
import { Logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

const logger = Logger.create('ItemSurveysList');

interface DashboardItemSurveysClientProps {
	itemId: string;
}

export function DashboardItemSurveysClient({ itemId }: DashboardItemSurveysClientProps) {
	const t = useTranslations('common');
	const [surveys, setSurveys] = useState<Survey[]>([]);
	const [loading, setLoading] = useState(true);

	const loadSurveys = useCallback(async () => {
		setLoading(true);
		try {
			const data = await surveyApiClient.getMany({ type: SurveyTypeEnum.ITEM, itemId });
			setSurveys(data.surveys);
		} catch (error) {
			logger.error('Error loading surveys', error);
			toast.error(t('FAILED_TO_LOAD_SURVEYS'));
		} finally {
			setLoading(false);
		}
	}, [itemId]);


	useEffect(() => {
		loadSurveys();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemId]);

	
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<Link
					href={`/dashboard/items/${itemId}`}
					className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
				>
					<ArrowLeft className="w-4 h-4" />
					{t('BACK_TO_ITEM_DASHBOARD')}
				</Link>
			</div>

			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">{t('ITEM_SURVEYS')}</h1>
				<p className="text-gray-600 dark:text-gray-400">{t('SURVEYS_FOR_LISTING')}</p>
			</div>

			<SurveysListClient
				surveys={surveys}
				loading={loading}
				emptyMessage={t('NO_SURVEYS_FOUND_FOR_ITEM')}
				emptySubMessage={t('CONTACT_ADMIN_CREATE_SURVEYS')}
				getResponsesLink={(survey) => `/dashboard/items/${itemId}/surveys/${survey.slug}/responses`}
				getPreviewLink={(survey) => `/dashboard/items/${itemId}/surveys/${survey.slug}/preview`}
			/>
		</div>
	);
}
