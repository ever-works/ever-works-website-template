import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.scss';
import { getCachedConfig } from '@/lib/content';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import { PHProvider } from './integration/posthog/provider';
import PostHogPageView from './integration/posthog/page-view';
import { Locale } from '@/lib/constants';
import { Suspense } from 'react';
import Script from 'next/script';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { siteConfig } from '@/lib/config';
import { SpeedInsights } from './integration/speed-insights';
import { Analytics } from './integration/analytics';
import { SettingsProvider } from '@/components/providers/settings-provider';
import { SettingsModalProvider } from '@/components/providers/settings-modal-provider';
import { SettingsModal } from '@/components/settings-modal';
import { NavigationLoadingBar } from '@/components/navigation-loading-bar';
import {
	getCategoriesEnabled,
	getTagsEnabled,
	getCompaniesEnabled,
	getSurveysEnabled,
	getHeaderSubmitEnabled,
	getHeaderPricingEnabled,
	getHeaderLayoutEnabled,
	getHeaderLanguageEnabled,
	getHeaderThemeEnabled,
	getHeaderMoreEnabled,
	getHeaderSettingsEnabled,
	getHeaderLayoutDefault,
	getHeaderPaginationDefault,
	getHeaderThemeDefault
} from '@/lib/utils/settings';
import { cleanUrl } from '@/lib/utils/url-cleaner';

const rawUrl =
	process.env.NEXT_PUBLIC_APP_URL?.trim() ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://demo.ever.works');
const appUrl = cleanUrl(rawUrl);

/**
 * Generate metadata dynamically using siteConfig
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	return {
		metadataBase: new URL(appUrl),
		title: `${siteConfig.name} | ${siteConfig.tagline}`,
		description: siteConfig.description,
		keywords: siteConfig.keywords,
		openGraph: {
			title: `${siteConfig.name} | ${siteConfig.tagline}`,
			description: siteConfig.description,
			type: 'website',
			siteName: siteConfig.name
		},
		alternates: {
			canonical: `/${locale}`
		}
	};
}

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
	// Next.js 16 / next-intl: unstable_setRequestLocale renamed to setRequestLocale
	setRequestLocale(locale);

	const config = await getCachedConfig();
	const messages = await getMessages();

	// Read settings server-side for instant availability
	const categoriesEnabled = getCategoriesEnabled();
	const tagsEnabled = getTagsEnabled();
	const companiesEnabled = getCompaniesEnabled();
	const surveysEnabled = getSurveysEnabled();
	const headerSettings = {
		submitEnabled: getHeaderSubmitEnabled(),
		pricingEnabled: getHeaderPricingEnabled(),
		layoutEnabled: getHeaderLayoutEnabled(),
		languageEnabled: getHeaderLanguageEnabled(),
		themeEnabled: getHeaderThemeEnabled(),
		moreEnabled: getHeaderMoreEnabled(),
		settingsEnabled: getHeaderSettingsEnabled(),
		layoutDefault: getHeaderLayoutDefault(),
		paginationDefault: getHeaderPaginationDefault(),
		themeDefault: getHeaderThemeDefault()
	};

	// Determine if the current locale is RTL
	return (
		<>
			<Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="beforeInteractive" />
			<PHProvider>
				<Suspense fallback={null}>
					<PostHogPageView />
				</Suspense>
				<NextIntlClientProvider messages={messages}>
					<Toaster position="bottom-right" richColors />
					<SettingsProvider
						categoriesEnabled={categoriesEnabled}
						tagsEnabled={tagsEnabled}
						companiesEnabled={companiesEnabled}
						surveysEnabled={surveysEnabled}
						headerSettings={headerSettings}
					>
						<SettingsModalProvider>
							<Providers config={config}>
								{/* Global navigation loading bar */}
								<NavigationLoadingBar />
								<ConditionalLayout>{children}</ConditionalLayout>
								{/* Settings Modal - Shared by header button */}
								<SettingsModal />
							</Providers>
						</SettingsModalProvider>
					</SettingsProvider>
				</NextIntlClientProvider>
			</PHProvider>
			{/*
				Vercel Speed Insights Integration
				- Automatically detects Vercel environment and Speed Insights availability
				- Gracefully degrades when not enabled or not on a paid plan
				- Supports environment variable configuration (NEXT_PUBLIC_SPEED_INSIGHTS_ENABLED, NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE)
				- See: app/[locale]/integration/speed-insights/
			*/}
			<Suspense fallback={null}>
				<SpeedInsights />
			</Suspense>
			{/*
				Vercel Analytics Integration
				- Automatically detects Vercel environment and Analytics availability
				- Gracefully degrades when not enabled or not on a paid plan
				- Supports environment variable configuration (NEXT_PUBLIC_ANALYTICS_ENABLED, NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE)
				- See: app/[locale]/integration/analytics/
			*/}
			<Suspense fallback={null}>
				<Analytics />
			</Suspense>
		</>
	);
}
