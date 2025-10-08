'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Survey } from '@/lib/db/schema';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveyFormWrapper } from '../forms/survey-form-wrapper';

interface SurveyPageClientProps {
	survey: Survey;
	itemSlug?: string;
}

export function SurveyPageClient({ survey, itemSlug }: SurveyPageClientProps) {
	const router = useRouter();

	const handleCompleted = () => {
		// Redirect after completion
		setTimeout(() => {
			if (itemSlug) {
				router.push(`/items/${itemSlug}`);
			} else {
				router.push('/surveys');
			}
		}, 2000);
	};

	if (survey.status !== 'published') {
		return (
			<div className="text-center">
				<h1 className="text-3xl font-bold mb-4">Survey Not Available</h1>
				<p className="text-gray-600 dark:text-gray-400">
					This survey is currently {survey.status} and not available for responses.
				</p>
			</div>
		);
	}

	return (
		<>
			{itemSlug && (
				<div className="mb-6">
					<Link href={`/items/${itemSlug}`}>
						<Button variant="ghost" className="gap-2">
							<ArrowLeft className="w-4 h-4" />
							Back to Item
						</Button>
					</Link>
				</div>
			)}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
				{survey.description && (
					<p className="text-gray-600 dark:text-gray-400">{survey.description}</p>
				)}
			</div>
			<SurveyFormWrapper
				survey={survey}
				itemSlug={itemSlug}
				onCompleted={handleCompleted}
				className="survey-public"
			/>
		</>
	);
}

