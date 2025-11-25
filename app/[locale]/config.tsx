'use client';

import type { Config } from '@/lib/content';
import React from 'react';
import { getAuthConfig } from '@/lib/auth/config';
import { defaultPricingConfig } from '@/lib/types';

const ConfigContext = React.createContext<Config>({});

// Initialize auth config once during module load
const initialAuthConfig = getAuthConfig();

export function ConfigProvider({ config, children }: { config: Config; children: React.ReactNode }) {
	const enhancedConfig = React.useMemo(() => {
        const pricing = config.pricing ?? defaultPricingConfig;
        const configWithPricing = { ...config, pricing };
		return { ...configWithPricing,
             authConfig: initialAuthConfig,
         };
	}, [config]);

	return <ConfigContext.Provider value={enhancedConfig}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
	const context = React.useContext<Config>(ConfigContext);
	if (!context) {
		throw new Error('useConfig must be used within a ConfigProvider');
	}
	return context;
}
