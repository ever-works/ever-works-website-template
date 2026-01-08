'use client';

import { createContext, useContext, PropsWithChildren } from 'react';
import type { HeaderSettings } from '@/lib/content';

const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
	submitEnabled: true,
	pricingEnabled: true,
	layoutEnabled: true,
	languageEnabled: true,
	themeEnabled: true,
	moreEnabled: true,
	settingsEnabled: true,
	layoutDefault: 'home1',
	paginationDefault: 'standard',
	themeDefault: 'light'
};

interface SettingsContextValue {
	// Feature enabled flags (from config)
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	companiesEnabled: boolean;
	surveysEnabled: boolean;
	// Data existence flags (from database/content)
	hasCategories: boolean;
	hasTags: boolean;
	hasCollections: boolean;
	hasGlobalSurveys: boolean;
	// Header settings
	headerSettings: HeaderSettings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps extends PropsWithChildren {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	companiesEnabled: boolean;
	surveysEnabled: boolean;
	hasCategories: boolean;
	hasTags: boolean;
	hasCollections: boolean;
	hasGlobalSurveys: boolean;
	headerSettings: HeaderSettings;
}

export function SettingsProvider({
	children,
	categoriesEnabled,
	tagsEnabled,
	companiesEnabled,
	surveysEnabled,
	hasCategories,
	hasTags,
	hasCollections,
	hasGlobalSurveys,
	headerSettings
}: SettingsProviderProps) {
	return (
		<SettingsContext.Provider
			value={{
				categoriesEnabled,
				tagsEnabled,
				companiesEnabled,
				surveysEnabled,
				hasCategories,
				hasTags,
				hasCollections,
				hasGlobalSurveys,
				headerSettings
			}}
		>
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
			companiesEnabled: true,
			surveysEnabled: true,
			hasCategories: true,
			hasTags: true,
			hasCollections: true,
			hasGlobalSurveys: false,
			headerSettings: DEFAULT_HEADER_SETTINGS
		};
	}
	return context;
}
