'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	leftLabel?: string;
	rightLabel?: string;
	className?: string;
}

export function ToggleSwitch({
	checked,
	onChange,
	disabled = false,
	leftLabel,
	rightLabel,
	className,
}: ToggleSwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => !disabled && onChange(!checked)}
			className={cn(
				'inline-flex items-center gap-3 px-1 py-0.5 rounded-full transition-colors duration-200',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-500 focus-visible:ring-offset-2',
				disabled && 'opacity-50 cursor-not-allowed',
				className
			)}
		>
			{/* Left Label */}
			{leftLabel && (
				<span
					className={cn(
						'text-sm font-medium transition-colors duration-200',
						!checked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
					)}
				>
					{leftLabel}
				</span>
			)}

			{/* Toggle Track */}
			<div
				className={cn(
					'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
					checked ? 'bg-theme-primary-500' : 'bg-gray-300 dark:bg-gray-600'
				)}
			>
				{/* Toggle Thumb */}
				<span
					className={cn(
						'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200',
						checked ? 'translate-x-6' : 'translate-x-1'
					)}
				/>
			</div>

			{/* Right Label */}
			{rightLabel && (
				<span
					className={cn(
						'text-sm font-medium transition-colors duration-200',
						checked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
					)}
				>
					{rightLabel}
				</span>
			)}
		</button>
	);
}
