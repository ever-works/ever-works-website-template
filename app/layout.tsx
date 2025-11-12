import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './[locale]/globals.css';
import { LayoutProvider, ThemeProvider } from '@/components/providers';
import { siteConfig } from '@/lib/config';
import { initializeBackgroundJobs } from '@/lib/background-jobs/initialize-jobs';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	// Initialize background jobs (Server Component - runs only on server)
	if (process.env.NODE_ENV !== 'test') {
		await initializeBackgroundJobs();
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
