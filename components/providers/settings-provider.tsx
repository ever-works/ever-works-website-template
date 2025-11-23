'use client';

import { createContext, useContext, PropsWithChildren } from 'react';
import type { HeaderSettings } from '@/lib/content';

const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
	submitEnabled: true,
	pricingEnabled: true,
	layoutEnabled: true,
	languageEnabled: true,
	themeEnabled: true,
};

interface SettingsContextValue {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	surveysEnabled: boolean;
	headerSettings: HeaderSettings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps extends PropsWithChildren {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	surveysEnabled: boolean;
	headerSettings: HeaderSettings;
}

export function SettingsProvider({
	children,
	categoriesEnabled,
	tagsEnabled,
	surveysEnabled,
	headerSettings,
}: SettingsProviderProps) {
	return (
		<SettingsContext.Provider value={{ categoriesEnabled, tagsEnabled, surveysEnabled, headerSettings }}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings(): SettingsContextValue {
	const context = useContext(SettingsContext);
	if (!context) {
		// Fallback for components rendered outside provider (backward compatibility)
		return {
			categoriesEnabled: true,
			tagsEnabled: true,
			surveysEnabled: true,
			headerSettings: DEFAULT_HEADER_SETTINGS,
		};
	}
	return context;
}
