import { Card, CardBody } from '@heroui/react';
import { Users, UserCheck, Shield, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTopProviderName, getTopProviderCount } from '../utils/client-helpers';

interface ClientStatsData {
	overview: {
		total: number;
		active: number;
	};
	activity: {
		newThisWeek: number;
		newThisMonth: number;
	};
	byProvider: Record<string, number>;
	growth: {
		monthlyGrowth: number;
	};
}

interface ClientStatsProps {
	stats: ClientStatsData;
}

const STAT_CARD_WRAPPER = 'border-0 shadow-lg';
const STAT_CARD_BODY = 'p-6';
const STAT_ICON_BASE = 'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg';

/**
 * Client Statistics Component
 * Displays overview statistics for client management
 * Following SRP: Only responsible for displaying statistics
 */
export function ClientStats({ stats }: ClientStatsProps) {
	const t = useTranslations('admin.ADMIN_CLIENTS_PAGE');

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{/* Total Clients */}
			<Card className={STAT_CARD_WRAPPER}>
				<CardBody className={STAT_CARD_BODY}>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								{t('TOTAL_CLIENTS')}
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.overview.total}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								+{stats.activity.newThisWeek} {t('THIS_WEEK')}
							</p>
						</div>
						<div className={`${STAT_ICON_BASE} bg-gradient-to-br from-blue-500 to-blue-600`}>
							<Users aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Active Clients */}
			<Card className={STAT_CARD_WRAPPER}>
				<CardBody className={STAT_CARD_BODY}>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								{t('ACTIVE_CLIENTS')}
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.overview.active}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{stats.overview.total > 0
									? Math.round((stats.overview.active / stats.overview.total) * 100)
									: 0}
								{t('OF_TOTAL')}
							</p>
						</div>
						<div className={`${STAT_ICON_BASE} bg-gradient-to-br from-green-500 to-green-600`}>
							<UserCheck aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Top Provider */}
			<Card className={STAT_CARD_WRAPPER}>
				<CardBody className={STAT_CARD_BODY}>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								{t('TOP_PROVIDER')}
							</p>
							<p className="text-lg font-bold text-gray-900 dark:text-white">
								{getTopProviderName(stats.byProvider)}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{getTopProviderCount(stats.byProvider)} {t('USERS')}
							</p>
						</div>
						<div className={`${STAT_ICON_BASE} bg-gradient-to-br from-purple-500 to-purple-600`}>
							<Shield aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Growth Rate */}
			<Card className={STAT_CARD_WRAPPER}>
				<CardBody className={STAT_CARD_BODY}>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								{t('MONTHLY_GROWTH')}
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								+{stats.growth.monthlyGrowth}%
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{stats.activity.newThisMonth} {t('NEW_CLIENTS')}
							</p>
						</div>
						<div className={`${STAT_ICON_BASE} bg-gradient-to-br from-emerald-500 to-emerald-600`}>
							<TrendingUp aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
