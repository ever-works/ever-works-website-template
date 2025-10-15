'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { surveyApiClient } from '@/lib/api/survey-api.client';
import type { SurveyItem } from '@/lib/db/schema';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SurveyStatusEnum, SurveyTypeEnum } from '@/lib/constants';
import { formatDateTime } from '@/utils/date';

interface ItemSurveysSectionProps {
	itemId: string;
	itemSlug: string;
}

export function ItemSurveysSection({ itemId, itemSlug }: ItemSurveysSectionProps) {
	const [surveys, setSurveys] = useState<SurveyItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadSurveys();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemId]);

	const loadSurveys = async () => {
		try {
			setLoading(true);
			const data = await surveyApiClient.getMany({
				type: SurveyTypeEnum.ITEM,
				itemId,
				status: SurveyStatusEnum.PUBLISHED
			});
			setSurveys(data.surveys);
		} catch (error) {
			console.error('Error loading surveys:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
				<div className="flex items-center gap-2 mb-4">
					<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
					<h2 className="text-xl font-semibold">Surveys</h2>
				</div>
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					Loading surveys...
				</div>
			</div>
		);
	}

	if (surveys.length === 0) {
		return null; // Don't show section if no surveys
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'published':
				return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
			case 'closed':
				return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
			default:
				return <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'published':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'closed':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
		}
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				<h2 className="text-xl font-semibold">Feedback Surveys</h2>
			</div>

			<p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
				Help us improve by sharing your experience with this tool
			</p>

			<div className="space-y-3">
				{surveys.map((survey) => (
					<Link
						key={survey.id}
						href={`/items/${itemSlug}/surveys/${survey.slug}`}
						className="block group"
					>
						<div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-transparent to-transparent hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10">
							<div className="flex items-start justify-between mb-2">
								<div className="flex-1">
									<h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
										{survey.title}
									</h3>
									{survey.description && (
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
											{survey.description}
										</p>
									)}
								</div>
								<div className="flex items-center gap-2 ml-4">
									{survey.isCompletedByUser && (
										<span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 mr-2">
											<CheckCircle className="w-3 h-3" />
											Completed
										</span>
									)}
									<span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(survey.status)}`}>
										{getStatusIcon(survey.status)}
										{survey.status}
									</span>
								</div>
							</div>

							<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
								<span className="text-xs text-gray-500 dark:text-gray-400">
									{survey.publishedAt
										? `Published ${formatDateTime(survey.publishedAt)}`
										: 'Not yet published'
									}
								</span>
								<span className={`text-sm font-medium group-hover:translate-x-1 transition-transform ${survey.isCompletedByUser
										? 'text-green-600 dark:text-green-400'
										: 'text-blue-600 dark:text-blue-400'
									}`}>
									{survey.isCompletedByUser ? 'Retake Survey →' : 'Take Survey →'}
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

