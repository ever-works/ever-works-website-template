'use client';

import React from 'react';
import Link from 'next/link';
import type { Survey } from '@/lib/db/schema';
import { getStatusColor, getTypeColor, getPublicSurveyLink, copyToClipboard, formatSurveyTypeLabel, formatSurveyStatusLabel } from '../utils/survey-helpers';
import { toast } from 'sonner';
import { Copy, Eye, FileText } from 'lucide-react';

interface SurveysListClientProps {
	surveys: Survey[];
	loading: boolean;
	showTypeColumn?: boolean;
	showResponsesColumn?: boolean;
	showUpdatedColumn?: boolean;
	emptyMessage?: string;
	emptySubMessage?: string;
	getResponsesLink?: (survey: Survey) => string;
	getPreviewLink?: (survey: Survey) => string;
	additionalActions?: (survey: Survey) => React.ReactNode;
}

export function SurveysListClient({
	surveys,
	loading,
	showTypeColumn = false,
	showResponsesColumn = false,
	showUpdatedColumn = false,
	emptyMessage = 'No surveys found.',
	emptySubMessage,
	getResponsesLink,
	getPreviewLink,
	additionalActions,
}: SurveysListClientProps) {

	const handleCopyLink = async (survey: Survey) => {
		const link = getPublicSurveyLink(survey.slug, survey.itemId || undefined);
		const success = await copyToClipboard(link);
		if (success) {
			toast.success('Survey link copied to clipboard!');
		} else {
			toast.error('Failed to copy link');
		}
	};

	if (loading) {
		return (
			<div className="text-center py-16">
				<p className="text-gray-500 dark:text-gray-400">Loading surveys...</p>
			</div>
		);
	}

	if (surveys.length === 0) {
		return (
			<div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
				<p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
				{emptySubMessage && (
					<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{emptySubMessage}</p>
				)}
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50 dark:bg-gray-900">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Name
							</th>
							{showTypeColumn && (
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Type
								</th>
							)}
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Status
							</th>
							{showResponsesColumn && (
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Responses
								</th>
							)}
							{showUpdatedColumn && (
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Updated
								</th>
							)}
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
						{surveys.map((survey) => (
							<tr key={survey.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
								<td className="px-6 py-4">
									<div className="font-medium">{survey.title}</div>
									{survey.itemId && showTypeColumn && (
										<div className="text-sm text-gray-500 dark:text-gray-400">Item ID: {survey.itemId}</div>
									)}
								</td>
								{showTypeColumn && (
									<td className="px-6 py-4">
										<span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(survey.type)}`}>
											{formatSurveyTypeLabel(survey.type)}
										</span>
									</td>
								)}
								<td className="px-6 py-4">
									<span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(survey.status)}`}>
										{formatSurveyStatusLabel(survey.status)}
									</span>
								</td>
								{showResponsesColumn && (
									<td className="px-6 py-4 text-sm">
										{(survey as Survey & { responseCount: number }).responseCount || 0}
									</td>
								)}
								{showUpdatedColumn && (
									<td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
										{new Date(survey.updatedAt).toLocaleDateString()}
									</td>
								)}
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										{additionalActions?.(survey)}
										{getResponsesLink && (
											<Link
												href={getResponsesLink(survey)}
												className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
												title="View Responses"
											>
												<FileText className="w-4 h-4" />
											</Link>
										)}
										{getPreviewLink && (
											<Link
												href={getPreviewLink(survey)}
												className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
												title="Preview"
											>
												<Eye className="w-4 h-4" />
											</Link>
										)}
										<button
											type="button"
											onClick={() => handleCopyLink(survey)}
											className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
											title="Copy Public Link"
										>
											<Copy className="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

