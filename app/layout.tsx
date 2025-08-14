import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './[locale]/globals.css';
import { LayoutProvider, ThemeProvider } from '@/components/providers';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

export const metadata: Metadata = {
	title: '404 - Page Not Found | Ever Works',
	description: "The page you're looking for doesn't exist.",
	robots: 'noindex'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased dark:!bg-dark--theme-950`}>
				<ThemeProvider>
					<LayoutProvider>{children}</LayoutProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
