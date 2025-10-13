'use client';

import { useTranslations } from 'next-intl';

/**
 * Admin Companies Page
 * Base page for company management with admin-only access
 * Access control is handled by the admin layout
 */
export default function CompaniesPage() {
	const t = useTranslations('admin.ADMIN_COMPANIES_PAGE');

	return (
		<div className="p-6 max-w-7xl mx-auto">
			{/* Page Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('TITLE')}</h1>
				<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('SUBTITLE')}</p>
			</div>

			{/* Placeholder Content */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<p className="text-gray-600 dark:text-gray-400">{t('COMING_SOON')}</p>
			</div>
		</div>
	);
}
