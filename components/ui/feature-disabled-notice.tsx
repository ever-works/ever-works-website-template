'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';

interface FeatureDisabledNoticeProps {
	feature: string;
	className?: string;
}

export function FeatureDisabledNotice({ feature, className = '' }: FeatureDisabledNoticeProps) {
	const t = useTranslations('settings');

	return (
		<div
			className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 italic py-2 ${className}`}
		>
			<Info className="h-3 w-3 flex-shrink-0" />
			<span>{t('FEATURE_DISABLED_IN_SETTINGS', { feature })}</span>
		</div>
	);
}
