import { Card, CardBody } from '@heroui/react';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CompanyStats as Stats } from '@/hooks/use-admin-companies';

interface CompanyStatsProps {
	stats: Stats;
}

const STAT_CARD_WRAPPER = 'border-0 shadow-lg';
const STAT_CARD_BODY = 'p-6';
const STAT_ICON_BASE = 'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg';

/**
 * Company Statistics Component
 * Displays overview statistics for company management
 */
export function CompanyStats({ stats }: CompanyStatsProps) {
	const t = useTranslations('admin.ADMIN_COMPANIES_PAGE');

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			{/* Total Companies */}
			<Card className={STAT_CARD_WRAPPER}>
				<CardBody className={STAT_CARD_BODY}>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('TOTAL_COMPANIES')}</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
						</div>
						<div className={`${STAT_ICON_BASE} bg-linear-to-br from-cyan-500 to-blue-600`}>
							<Building2 aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Active Companies */}
			<Card className={STAT_CARD_WRAPPER}>
				<CardBody className={STAT_CARD_BODY}>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('ACTIVE_COMPANIES')}</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
							</p>
						</div>
						<div className={`${STAT_ICON_BASE} bg-linear-to-br from-green-500 to-green-600`}>
							<CheckCircle aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Inactive Companies */}
			<Card className={STAT_CARD_WRAPPER}>
				<CardBody className={STAT_CARD_BODY}>
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('INACTIVE_COMPANIES')}</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total
							</p>
						</div>
						<div className={`${STAT_ICON_BASE} bg-linear-to-br from-gray-500 to-gray-600`}>
							<XCircle aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
