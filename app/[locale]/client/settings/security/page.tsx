import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { FiShield, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChangePasswordForm } from '@/components/settings/security';

export default function SecuritySettingsPage() {
	const t = useTranslations('settings.SECURITY_PAGE');

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
			<Container maxWidth="7xl" padding="default">
				<div className="space-y-8 py-8">
					{/* Header */}
					<div className="flex items-center gap-4">
						<Link
							        href="/client/settings/profile"
							className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						>
							<FiArrowLeft className="w-4 h-4" />
							{t('BACK_TO_SETTINGS')}
						</Link>
					</div>

					{/* Change Password Section */}
					<div id="change-password" className="max-w-3xl mx-auto">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
								{t('CHANGE_PASSWORD.TITLE')}
							</h2>
							<p className="text-gray-600 dark:text-gray-300">{t('CHANGE_PASSWORD.DESCRIPTION')}</p>
						</div>
						<ChangePasswordForm />
					</div>
					{/* Security Tips */}
					<div className="max-w-3xl mx-auto mt-12">
						<Card className="border border-theme-primary-200 dark:border-theme-primary-800 bg-theme-primary-50 dark:bg-theme-primary-10">
							<CardContent className="p-6">
								<h3 className="text-lg font-semibold text-theme-primary-900 dark:text-theme-primary-100 mb-3 flex items-center gap-2">
									<FiShield className="w-5 h-5" />
									{t('SECURITY_TIPS.TITLE')}
								</h3>
								<ul className="space-y-2 text-theme-primary-800 dark:text-theme-primary-200 text-sm">
									<li className="flex items-start gap-2">
										<span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
										{t('SECURITY_TIPS.TIP_1')}
									</li>
									<li className="flex items-start gap-2">
										<span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
										{t('SECURITY_TIPS.TIP_2')}
									</li>
									<li className="flex items-start gap-2">
										<span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
										{t('SECURITY_TIPS.TIP_3')}
									</li>
									<li className="flex items-start gap-2">
										<span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
										{t('SECURITY_TIPS.TIP_4')}
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</Container>
		</div>
	);
}
