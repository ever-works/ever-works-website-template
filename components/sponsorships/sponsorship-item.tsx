'use client';

import { useTranslations } from 'next-intl';
import { FiCalendar, FiDollarSign, FiClock, FiPackage } from 'react-icons/fi';
import type { SponsorAd } from '@/lib/db/schema';
import type { SponsorAdStatus } from '@/lib/types/sponsor-ad';

export interface SponsorshipItemProps {
	sponsorAd: SponsorAd;
}

// Status badge configuration
const STATUS_CONFIG: Record<SponsorAdStatus, {
	bg: string;
	text: string;
	labelKey: string
}> = {
	pending_payment: {
		bg: 'bg-yellow-100 dark:bg-yellow-900/30',
		text: 'text-yellow-700 dark:text-yellow-400',
		labelKey: 'STATUS_PENDING_PAYMENT',
	},
	pending: {
		bg: 'bg-blue-100 dark:bg-blue-900/30',
		text: 'text-blue-700 dark:text-blue-400',
		labelKey: 'STATUS_PENDING_REVIEW',
	},
	active: {
		bg: 'bg-green-100 dark:bg-green-900/30',
		text: 'text-green-700 dark:text-green-400',
		labelKey: 'STATUS_ACTIVE',
	},
	expired: {
		bg: 'bg-gray-100 dark:bg-gray-800',
		text: 'text-gray-700 dark:text-gray-400',
		labelKey: 'STATUS_EXPIRED',
	},
	rejected: {
		bg: 'bg-red-100 dark:bg-red-900/30',
		text: 'text-red-700 dark:text-red-400',
		labelKey: 'STATUS_REJECTED',
	},
	cancelled: {
		bg: 'bg-gray-100 dark:bg-gray-800',
		text: 'text-gray-700 dark:text-gray-400',
		labelKey: 'STATUS_CANCELLED',
	},
};

function formatDate(date: Date | null | undefined): string {
	if (!date) return '-';
	return new Date(date).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

function formatAmount(amount: number, currency: string = 'usd'): string {
	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: currency.toUpperCase(),
	}).format(amount / 100);
}

export function SponsorshipItem({ sponsorAd }: SponsorshipItemProps) {
	const t = useTranslations('client.sponsorships');

	const statusConfig = STATUS_CONFIG[sponsorAd.status as SponsorAdStatus] || STATUS_CONFIG.pending;

	return (
		<div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				{/* Item Info */}
				<div className="flex items-start gap-3 min-w-0 flex-1">
					<div className="flex-shrink-0 w-10 h-10 bg-linear-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-lg flex items-center justify-center">
						<FiPackage className="w-5 h-5 text-theme-primary-600 dark:text-theme-primary-400" />
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
							{sponsorAd.itemSlug}
						</h3>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
							<span className="inline-flex items-center gap-1">
								<FiClock className="w-3.5 h-3.5" />
								{t(`INTERVAL_${sponsorAd.interval?.toUpperCase()}`)}
							</span>
							<span className="inline-flex items-center gap-1">
								<FiDollarSign className="w-3.5 h-3.5" />
								{formatAmount(sponsorAd.amount, sponsorAd.currency)}
							</span>
						</div>
					</div>
				</div>

				{/* Status & Dates */}
				<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
					{/* Dates */}
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
						<FiCalendar className="w-4 h-4 flex-shrink-0" />
						<span>
							{formatDate(sponsorAd.startDate)} - {formatDate(sponsorAd.endDate)}
						</span>
					</div>

					{/* Status Badge */}
					<span
						className={`
							inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap
							${statusConfig.bg} ${statusConfig.text}
						`}
					>
						{t(statusConfig.labelKey)}
					</span>
				</div>
			</div>

			{/* Rejection reason if rejected */}
			{sponsorAd.status === 'rejected' && sponsorAd.rejectionReason && (
				<div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
					<p className="text-sm text-red-700 dark:text-red-400">
						<span className="font-medium">{t('REJECTION_REASON')}:</span> {sponsorAd.rejectionReason}
					</p>
				</div>
			)}

			{/* Cancellation reason if cancelled */}
			{sponsorAd.status === 'cancelled' && sponsorAd.cancelReason && (
				<div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-700 dark:text-gray-400">
						<span className="font-medium">{t('CANCEL_REASON')}:</span> {sponsorAd.cancelReason}
					</p>
				</div>
			)}
		</div>
	);
}

export function SponsorshipItemSkeleton() {
	return (
		<div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-start gap-3 flex-1">
					<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
					<div className="flex-1 space-y-2">
						<div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
						<div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
					<div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
				</div>
			</div>
		</div>
	);
}
