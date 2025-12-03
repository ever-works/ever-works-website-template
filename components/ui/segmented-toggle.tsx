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
				'relative inline-flex items-center',
				'rounded-lg',
				'bg-gradient-to-r from-gray-100 to-gray-50',
				'dark:from-gray-800 dark:to-gray-800/90',
				'border border-gray-200/80 dark:border-gray-700/80',
				'backdrop-blur-sm',
				'p-1',
				disabled && 'opacity-50 cursor-not-allowed',
				className
			)}
			role="group"
		>
			{/* Sliding indicator with gradient and glow */}
			<div
				className={cn(
					'absolute inset-y-1 rounded-md',
					'bg-gradient-to-r from-theme-primary-500 to-theme-primary-600',
					'dark:from-theme-primary-600 dark:to-theme-primary-700',
					'shadow-lg shadow-theme-primary-500/30',
					'transition-all duration-300 ease-out',
					'transform',
					'animate-pulse-subtle',
					value ? 'translate-x-[calc(100%+0.25rem)]' : 'translate-x-0'
				)}
				style={{
					width: 'calc(50% - 0.25rem)',
				}}
				aria-hidden="true"
			/>

			{/* Left Option Button */}
			<button
				type="button"
				onClick={() => !disabled && onChange(false)}
				disabled={disabled}
				className={cn(
					'relative z-10 px-3 py-1.5 text-sm font-medium rounded-md',
					'transition-colors duration-300',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-500 focus-visible:ring-offset-1',
					!value
						? 'text-white dark:text-white'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
					disabled && 'cursor-not-allowed'
				)}
			>
				{leftLabel}
			</button>

			{/* Right Option Button */}
			<button
				type="button"
				onClick={() => !disabled && onChange(true)}
				disabled={disabled}
				className={cn(
					'relative z-10 px-3 py-1.5 text-sm font-medium rounded-md',
					'transition-colors duration-300',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-500 focus-visible:ring-offset-1',
					value
						? 'text-white dark:text-white'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
					disabled && 'cursor-not-allowed'
				)}
			>
				{rightLabel}
			</button>
		</div>
	);
}
