import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
import { ConditionalLayout } from '@/components/layout/Conditional-layout';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

// Base metadata that will be enhanced with dynamic locale
export const metadata: Metadata = {
	title: 'Ever Works | Professional Services',
	description: 'Ever Works - Professional services and solutions for your business',
	keywords: ['Ever Works', 'Professional Services', 'Business Solutions'],
	openGraph: {
		title: 'Ever Works | Professional Services',
		description: 'Ever Works - Professional services and solutions for your business',
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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-dark--theme-950`}>
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
