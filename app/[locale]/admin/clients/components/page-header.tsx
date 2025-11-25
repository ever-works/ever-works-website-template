import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PageHeaderProps {
	onAddClient: () => void;
}

const HEADER_WRAPPER =
	'bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6';
const ICON_WRAPPER =
	'w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg';
const ADD_BUTTON_CLASSES =
	'bg-linear-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40 transition-all duration-300 text-white font-medium';

/**
 * Page Header Component
 * Displays page title and add client button
 * Following SRP: Only responsible for header display
 */
export function PageHeader({ onAddClient }: PageHeaderProps) {
	const t = useTranslations('admin.ADMIN_CLIENTS_PAGE');

	return (
		<div className="mb-8">
			<div className={HEADER_WRAPPER}>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center space-x-4">
						<div className={ICON_WRAPPER}>
							<Building2 aria-hidden="true" className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('TITLE')}</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-1">{t('SUBTITLE')}</p>
						</div>
					</div>
					<Button color="primary" size="lg" onClick={onAddClient} className={ADD_BUTTON_CLASSES}>
						<Plus size={18} />
						{t('ADD_CLIENT')}
					</Button>
				</div>
			</div>
		</div>
	);
}
