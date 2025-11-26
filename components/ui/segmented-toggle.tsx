'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SegmentedToggleProps {
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	leftLabel?: string;
	rightLabel?: string;
	className?: string;
}

export function SegmentedToggle({
	value,
	onChange,
	disabled = false,
	leftLabel,
	rightLabel,
	className,
}: SegmentedToggleProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1',
				'border border-gray-200 dark:border-gray-700',
				disabled && 'opacity-50 cursor-not-allowed',
				className
			)}
			role="group"
		>
			{/* Left Option */}
			<button
				type="button"
				onClick={() => !disabled && onChange(false)}
				disabled={disabled}
				className={cn(
					'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-500 focus-visible:ring-offset-1',
					!value
						? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
					disabled && 'cursor-not-allowed'
				)}
			>
				{leftLabel}
			</button>

			{/* Right Option */}
			<button
				type="button"
				onClick={() => !disabled && onChange(true)}
				disabled={disabled}
				className={cn(
					'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-500 focus-visible:ring-offset-1',
					value
						? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
					disabled && 'cursor-not-allowed'
				)}
			>
				{rightLabel}
			</button>
		</div>
	);
}
