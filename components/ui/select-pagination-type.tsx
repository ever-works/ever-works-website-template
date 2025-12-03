'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLayoutTheme } from '@/components/context';
import { useTranslations } from 'next-intl';
import { SegmentedToggle } from './segmented-toggle';
import { List } from 'lucide-react';
import { toast } from 'sonner';

interface SelectPaginationTypeProps {
	className?: string;
	disabled?: boolean;
}

const SelectPaginationType: React.FC<SelectPaginationTypeProps> = ({ className, disabled = false }) => {
	const { paginationType, setPaginationType } = useLayoutTheme();
	const t = useTranslations('settings');

	const handleToggle = (isInfinite: boolean) => {
		if (disabled) return;
		const newType = isInfinite ? 'infinite' : 'standard';
		setPaginationType(newType);

		// Toast notification
		toast.success(
			t(isInfinite ? 'PAGINATION_CHANGED_TO_INFINITE' : 'PAGINATION_CHANGED_TO_STANDARD'),
			{
				duration: 2000,
				description: t('SETTINGS_SAVED_AUTOMATICALLY')
			}
		);
	};

	return (
		<div className={cn(
			// Structure
			'p-5 rounded-xl',

			// Background with gradient
			'bg-gradient-to-br from-white to-gray-50/50',
			'dark:from-gray-800/50 dark:to-gray-900/50',

			// Border
			'border border-gray-200/60 dark:border-gray-700/60',

			// Shadow
			'shadow-sm hover:shadow-md',

			// Transition
			'transition-all duration-300 ease-out',

			// Hover effect
			'hover:scale-[1.01] hover:border-theme-primary-300/50 dark:hover:border-theme-primary-600/50',

			// Animation entrance
			'animate-fade-in-up',

			className
		)}>
			<div className="flex items-start justify-between gap-4">
				{/* Icon + Title/Description */}
				<div className="flex items-start gap-3 flex-1 min-w-0">
					{/* Icon container */}
					<div className={cn(
						'p-2 rounded-lg flex-shrink-0',
						'bg-gradient-to-br from-theme-primary-100 to-theme-primary-200',
						'dark:from-theme-primary-900/30 dark:to-theme-primary-800/30',
						'border border-theme-primary-300/50 dark:border-theme-primary-600/50'
					)}>
						<List className="h-5 w-5 text-theme-primary-600 dark:text-theme-primary-400" />
					</div>

					{/* Text content */}
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							{t('PAGINATION_STYLE')}
						</h3>
						<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
							{t('PAGINATION_STYLE_DESC')}
						</p>
					</div>
				</div>

				{/* Toggle */}
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
		</div>
	);
};

export default SelectPaginationType;
