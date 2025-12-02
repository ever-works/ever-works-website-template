'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLayoutTheme } from '@/components/context';
import { useTranslations } from 'next-intl';
import { SegmentedToggle } from './segmented-toggle';

interface SelectDatabaseModeProps {
	className?: string;
	disabled?: boolean;
}

const SelectDatabaseMode: React.FC<SelectDatabaseModeProps> = ({ className, disabled = false }) => {
	const { databaseSimulationMode, setDatabaseSimulationMode } = useLayoutTheme();
	const t = useTranslations('settings');

	const handleToggle = (isDisabled: boolean) => {
		if (disabled) return;
		const newMode = isDisabled ? 'disabled' : 'enabled';
		setDatabaseSimulationMode(newMode);
	};

	return (
		<div className={cn('flex items-start justify-between gap-4', className)}>
			{/* Left: Title and Description */}
			<div className="flex-1 min-w-0">
				<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
					{t('DATABASE_MODE')}
				</h3>
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
					{t('DATABASE_MODE_DESC')}
				</p>
			</div>

			{/* Right: Segmented Toggle */}
			<div className="flex-shrink-0">
				<SegmentedToggle
					value={databaseSimulationMode === 'disabled'}
					onChange={handleToggle}
					disabled={disabled}
					leftLabel={t('DATABASE_ENABLED_LABEL')}
					rightLabel={t('DATABASE_DISABLED_LABEL')}
				/>
			</div>
		</div>
	);
};

export default SelectDatabaseMode;
