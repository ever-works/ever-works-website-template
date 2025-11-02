'use client';

import type { Config } from '@/lib/content';
import { HeroUIProvider } from '@heroui/react';
import { ConfigProvider } from './config';
import {
	ConfirmProvider,
	ErrorProvider,
	FilterProvider,
	LayoutProvider,
	QueryClientProvider,
	ThemeProvider
} from '@/components/providers';
import { SessionProvider } from 'next-auth/react';
import { LoginModalProvider } from '@/components/auth/login-modal-provider';

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
						<ConfirmProvider>
							<FilterProvider>
								<ConfigProvider config={config}>
									<ThemeProvider>
										<HeroUIProvider>
											<LoginModalProvider />
											{children}
										</HeroUIProvider>
									</ThemeProvider>
								</ConfigProvider>
							</FilterProvider>
						</ConfirmProvider>
					</ErrorProvider>
				</LayoutProvider>
			</QueryClientProvider>
		</SessionProvider>
	);
}
