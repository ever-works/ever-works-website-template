'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Info, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureDisabledNoticeProps {
	feature: string;
	variant?: 'info' | 'warning' | 'danger';
	className?: string;
	hideInSimilarProducts?: boolean;
}

const variantStyles = {
	info: {
		container: 'bg-gradient-to-r from-blue-100/90 to-cyan-100/90 dark:from-blue-500/20 dark:to-cyan-500/20 border-blue-300 dark:border-blue-500/40',
		text: 'text-blue-900 dark:text-blue-200',
		icon: 'text-blue-700 dark:text-blue-300',
		Icon: Info,
	},
	warning: {
		container: 'bg-gradient-to-r from-amber-100/90 to-orange-100/90 dark:from-amber-500/20 dark:to-orange-500/20 border-amber-300 dark:border-amber-500/40',
		text: 'text-amber-900 dark:text-amber-200',
		icon: 'text-amber-700 dark:text-amber-300',
		Icon: AlertCircle,
	},
	danger: {
		container: 'bg-gradient-to-r from-red-100/90 to-pink-100/90 dark:from-red-500/20 dark:to-pink-500/20 border-red-300 dark:border-red-500/40',
		text: 'text-red-900 dark:text-red-200',
		icon: 'text-red-700 dark:text-red-300',
		Icon: AlertTriangle,
	},
} as const;

export function FeatureDisabledNotice({
	feature,
	variant = 'info',
	className = '',
	hideInSimilarProducts = false
}: FeatureDisabledNoticeProps) {
	const t = useTranslations('settings');
	const styles = variantStyles[variant];
	const IconComponent = styles.Icon;

	// Check if we're in a similar products context
	if (hideInSimilarProducts && typeof window !== 'undefined') {
		const path = window.location.pathname;
		if (path.includes('/items/')) {
			return null;
		}
	}

	return (
		<div
			className={cn(
				// Base structure
				'flex items-center gap-3',
				'px-4 py-3',
				'rounded-lg',
				'border',
				// Animations
				'animate-fade-in-up',
				'transition-all duration-200 ease-in-out',
				// Hover effects
				'hover:scale-[1.01]',
				// Variant styles
				styles.container,
				styles.text,
				// Custom className
				className
			)}
			role="status"
			aria-live="polite"
		>
			{/* Animated Icon */}
			<IconComponent
				className={cn(
					'h-5 w-5 flex-shrink-0',
					'animate-pulse-subtle',
					styles.icon
				)}
			/>

			{/* Text */}
			<span className="text-sm font-semibold">
				{t('FEATURE_DISABLED_IN_SETTINGS', { feature })}
			</span>
		</div>
	);
}
