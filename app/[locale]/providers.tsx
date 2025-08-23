'use client';

import type { Config } from '@/lib/content';
import { HeroUIProvider } from '@heroui/react';
import { ConfigProvider } from './config';
import {
	ErrorProvider,
	FilterProvider,
	LayoutProvider,
	QueryClientProvider,
	ThemeProvider
} from '@/components/providers';
import { SessionProvider } from 'next-auth/react';

interface ProvidersProps {
	config: Config;
	children: React.ReactNode;
	dehydratedState?: unknown;
}

export function Providers({ config, children, dehydratedState }: ProvidersProps) {
	return (
		<SessionProvider>
			<QueryClientProvider dehydratedState={dehydratedState}>
				<LayoutProvider>
					<ErrorProvider>
						<FilterProvider>
							<ConfigProvider config={config}>
								<ThemeProvider>
									<HeroUIProvider>{children}</HeroUIProvider>
								</ThemeProvider>
							</ConfigProvider>
						</FilterProvider>
					</ErrorProvider>
				</LayoutProvider>
			</QueryClientProvider>
		</SessionProvider>
	);
}
