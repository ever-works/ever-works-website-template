'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import type { Survey } from '@/lib/db/schema';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveysListClient } from './surveys-list-client';
import { useConfirm } from '@/components/providers';
import { SurveyTypeEnum } from '@/lib/constants';

export function AdminSurveysClient() {
	const router = useRouter();
	const { confirm } = useConfirm();
	const [surveys, setSurveys] = useState<(Survey & { responseCount: number })[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'global' | 'item'>('all');

	useEffect(() => {
		loadSurveys();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter]);

	const loadSurveys = async () => {
		setLoading(true);
		try {
			const type = filter === 'all' 
				? undefined 
				: filter === 'global' 
					? SurveyTypeEnum.GLOBAL 
					: SurveyTypeEnum.ITEM;
			const data = await surveyApiClient.getMany({ type });
			setSurveys(data.surveys);
		} catch (error) {
			console.error('Error loading surveys:', error);
			toast.error('Failed to load surveys');
		} finally {
			setLoading(false);
		}
	};

	const handleCreateSurvey = () => {
		router.push('/admin/surveys/create');
	};

	const handleEditSurvey = (slug: string) => {
		router.push(`/admin/surveys/${slug}/edit`);
	};

	const handleDeleteSurvey = async (slug: string, title: string) => {
		const confirmed = await confirm({
			title: 'Delete Survey',
			message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
			confirmText: 'Delete',
			cancelText: 'Cancel',
			variant: 'danger'
		});

		if (!confirmed) {
			return;
		}

		try {
			await surveyApiClient.delete(slug);
			toast.success('Survey deleted successfully!');
			loadSurveys();
		} catch (error) {
			console.error('Error deleting survey:', error);
			toast.error('Failed to delete survey');
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Surveys Management</h1>
					<p className="text-gray-600 dark:text-gray-400">Manage and monitor all surveys</p>
				</div>
				<Button
					onClick={handleCreateSurvey}
					variant="default"
					className="flex items-center gap-2"
				>
					<Plus className="w-5 h-5 mr-1" />
					Create Survey
				</Button>
			</div>

			{/* Filters */}
			<div className="mb-6 flex gap-2">
				<Button
					onClick={() => setFilter('all')}
					variant={filter === 'all' ? 'default' : 'outline'}
				>
					All Surveys
				</Button>
				<Button
					onClick={() => setFilter('global')}
					variant={filter === 'global' ? 'default' : 'outline'}
				>
					Global
				</Button>
				<Button
					onClick={() => setFilter('item')}
					variant={filter === 'item' ? 'default' : 'outline'}
				>
					Items
				</Button>
			</div>

			<SurveysListClient
				surveys={surveys}
				loading={loading}
				showTypeColumn={true}
				showResponsesColumn={true}
				showUpdatedColumn={true}
				getResponsesLink={(survey) => `/admin/surveys/${survey.slug}/responses`}
				getPreviewLink={(survey) => `/admin/surveys/${survey.slug}/preview`}
				additionalActions={(survey) => (
					<>
						<button
							onClick={() => handleEditSurvey(survey.slug)}
							className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
							title="Edit Survey"
						>
							<Edit className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleDeleteSurvey(survey.slug, survey.title)}
							className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
							title="Delete Survey"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</>
				)}
			/>
		</div>
	);
}
