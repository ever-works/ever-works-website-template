'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLayoutTheme } from '@/components/context';
import { useTranslations } from 'next-intl';
import { SegmentedToggle } from './segmented-toggle';

interface SelectPaginationTypeProps {
	className?: string;
	disabled?: boolean;
}

const SelectPaginationType: React.FC<SelectPaginationTypeProps> = ({ className, disabled = false }) => {
	const { paginationType, setPaginationType } = useLayoutTheme();
	const t = useTranslations('settings');

	const handleToggle = (isInfinite: boolean) => {
		if (disabled) return;
		setPaginationType(isInfinite ? 'infinite' : 'standard');
	};

	return (
		<div className={cn('flex items-start justify-between gap-4', className)}>
			{/* Left: Title and Description */}
			<div className="flex-1 min-w-0">
				<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
					{t('PAGINATION_STYLE')}
				</h3>
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
					{t('PAGINATION_STYLE_DESC')}
				</p>
			</div>

			{/* Right: Segmented Toggle */}
			<div className="flex-shrink-0">
				<SegmentedToggle
					value={paginationType === 'infinite'}
					onChange={handleToggle}
					disabled={disabled}
					leftLabel={t('PAGINATION_STANDARD_LABEL')}
					rightLabel={t('PAGINATION_INFINITE_LABEL')}
				/>
			</div>
		</div>
	);
};

export default SelectPaginationType;