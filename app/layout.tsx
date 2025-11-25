import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './[locale]/globals.css';
import { LayoutProvider, ThemeProvider } from '@/components/providers';
import { siteConfig } from '@/lib/config';
import { initializeBackgroundJobs } from '@/lib/background-jobs/initialize-jobs';
import { getSchedulingMode } from '@/lib/background-jobs/config';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

export const metadata: Metadata = {
	title: `404 - Page Not Found | ${siteConfig.name}`,
	description: "The page you're looking for doesn't exist.",
	robots: 'noindex'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	// Initialize background jobs based on scheduling mode
	// Skip initialization when Vercel cron is active (relies on external cron job)
	if (process.env.NODE_ENV !== 'test') {
		const schedulingMode = getSchedulingMode();

		if (schedulingMode === 'vercel') {
			console.log('[LAYOUT] Vercel cron detected - skipping internal background job initialization');
		} else if (schedulingMode === 'disabled') {
			console.log('[LAYOUT] Background jobs disabled (DISABLE_AUTO_SYNC=true)');
		} else {
			// Initialize for 'trigger-dev' or 'local' modes
			initializeBackgroundJobs().catch(err =>
				console.error('[LAYOUT] Background job init failed:', err)
			);
		}
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-dark--theme-950`} suppressHydrationWarning>
				<ThemeProvider>
					<LayoutProvider>{children}</LayoutProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
