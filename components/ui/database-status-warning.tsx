'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatureFlagsWithSimulation } from '@/hooks/use-feature-flags-with-simulation';

interface DatabaseStatusWarningProps {
	className?: string;
}

export function DatabaseStatusWarning({ className }: DatabaseStatusWarningProps) {
	const t = useTranslations('settings');
	const { features } = useFeatureFlagsWithSimulation();

	// Check if database is actually configured (not simulation)
	const isDatabaseConfigured = features.ratings || features.comments || features.favorites;

	// Only show if database is NOT configured
	if (isDatabaseConfigured) {
		return null;
	}

	return (
		<div
			className={cn(
				'flex items-start gap-3',
				'px-4 py-3',
				'rounded-lg',
				'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
				'border border-blue-200/50 dark:border-blue-700/50',
				'backdrop-blur-sm',
				'shadow-sm',
				'animate-fade-in-up',
				className
			)}
			role="status"
			aria-live="polite"
		>
			<Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-pulse-subtle" />
			<div>
				<h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
					{t('DATABASE_PREVIEW_MODE')}
				</h4>
				<p className="text-xs text-blue-700 dark:text-blue-300">
					{t('DATABASE_PREVIEW_MODE_DESC')}
				</p>
			</div>
		</div>
	);
}
