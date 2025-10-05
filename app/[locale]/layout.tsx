import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { getCachedConfig } from '@/lib/content';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import { PHProvider } from './integration/posthog/provider';
import PostHogPageView from './integration/posthog/page-view';
import { Locale } from '@/lib/constants';
import { LoginModalProvider } from '@/components/auth/login-modal-provider';
import { Suspense } from 'react';
import Script from 'next/script';
import { ConditionalLayout } from '@/components/layout/conditional-layout';

// Base metadata that will be enhanced with dynamic locale
export const metadata: Metadata = {
	title: 'Ever Works | The Open-Source, AI-Powered Directory Builder',
	description: 'Ever Works - The Open-Source, AI-Powered Directory Builder for creators, business owners, and developers',
	keywords: ['Ever Works', 'Directory Builder', 'Open Source', 'AI-Powered', 'Directory Template'],
	openGraph: {
		title: 'Ever Works | The Open-Source, AI-Powered Directory Builder',
		description: 'Ever Works - The Open-Source, AI-Powered Directory Builder for creators, business owners, and developers',
		type: 'website',
		siteName: 'Ever Works'
	}
};

export default async function RootLayout({
	children,
	params
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = await params;

	if (!routing.locales.includes(locale as Locale)) {
		notFound();
	}

	// Ensure server-side i18n helpers use the current route locale
	unstable_setRequestLocale(locale);

	const config = await getCachedConfig();
	const messages = await getMessages();

	// Determine if the current locale is RTL
	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`antialiased dark:bg-dark--theme-950`}>
				<Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="beforeInteractive" />
				<PHProvider>
					<Suspense fallback={null}>
						<PostHogPageView />
					</Suspense>
					<NextIntlClientProvider messages={messages}>
						<Toaster position="bottom-right" richColors />
						<Providers config={config}>
							<LoginModalProvider />
							<ConditionalLayout>{children}</ConditionalLayout>
						</Providers>
					</NextIntlClientProvider>
				</PHProvider>
			</body>
		</html>
	);
}
