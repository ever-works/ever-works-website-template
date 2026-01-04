'use client';

import { useTranslations } from 'next-intl';
import { FiDollarSign, FiCheck, FiClock, FiXCircle } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/card';
import type { SponsorAdStats } from '@/lib/types/sponsor-ad';

export interface SponsorshipStatsCardsProps {
	stats: SponsorAdStats;
	isLoading?: boolean;
}

interface StatCardConfig {
	key: 'total' | 'active' | 'pending' | 'expired';
	labelKey: string;
	icon: typeof FiDollarSign;
	colorClass: string;
	hoverShadow: string;
	iconBg: string;
}

const statCardsConfig: StatCardConfig[] = [
	{
		key: 'total',
		labelKey: 'TOTAL_SPONSORSHIPS',
		icon: FiDollarSign,
		colorClass: 'text-blue-600 dark:text-blue-400',
		hoverShadow: 'hover:shadow-blue-500/10',
		iconBg: 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40',
	},
	{
		key: 'active',
		labelKey: 'ACTIVE',
		icon: FiCheck,
		colorClass: 'text-green-600 dark:text-green-400',
		hoverShadow: 'hover:shadow-green-500/10',
		iconBg: 'from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40',
	},
	{
		key: 'pending',
		labelKey: 'PENDING',
		icon: FiClock,
		colorClass: 'text-yellow-600 dark:text-yellow-400',
		hoverShadow: 'hover:shadow-yellow-500/10',
		iconBg: 'from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40',
	},
	{
		key: 'expired',
		labelKey: 'EXPIRED',
		icon: FiXCircle,
		colorClass: 'text-gray-600 dark:text-gray-400',
		hoverShadow: 'hover:shadow-gray-500/10',
		iconBg: 'from-gray-100 to-gray-200 dark:from-gray-900/40 dark:to-gray-800/40',
	},
];

function getStatValue(stats: SponsorAdStats, key: StatCardConfig['key']): number {
	const overview = stats.overview;
	switch (key) {
		case 'total':
			return overview.total;
		case 'active':
			return overview.active;
		case 'pending':
			// Combine pending_payment and pending for display
			return overview.pendingPayment + overview.pending;
		case 'expired':
			return overview.expired;
		default:
			return 0;
	}
}

export function SponsorshipStatsCards({ stats, isLoading = false }: SponsorshipStatsCardsProps) {
	const t = useTranslations('client.sponsorships');

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
			{statCardsConfig.map((config) => {
				const Icon = config.icon;
				const value = getStatValue(stats, config.key);

				return (
					<Card
						key={config.key}
						className={`hover:shadow-lg ${config.hoverShadow} border border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs`}
					>
						<CardContent className="p-6">
							<div className="text-center">
								<div className={`flex items-center justify-center w-12 h-12 bg-linear-to-br ${config.iconBg} rounded-xl mb-3 mx-auto`}>
									<Icon className={`w-6 h-6 ${config.colorClass}`} />
								</div>
								{isLoading ? (
									<div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1 animate-pulse" />
								) : (
									<div className={`text-2xl font-bold ${config.key === 'total' ? 'text-gray-900 dark:text-gray-100' : config.colorClass}`}>
										{value}
									</div>
								)}
								<div className="text-sm text-gray-600 dark:text-gray-400">{t(config.labelKey)}</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

export function SponsorshipStatsCardsSkeleton() {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
			{Array.from({ length: 4 }).map((_, index) => (
				<Card
					key={index}
					className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs"
				>
					<CardContent className="p-6">
						<div className="text-center animate-pulse">
							<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3 mx-auto" />
							<div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
							<div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
