'use client';

import { createContext, useContext, PropsWithChildren } from 'react';

interface SettingsContextValue {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	companiesEnabled: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps extends PropsWithChildren {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	companiesEnabled: boolean;
}

export function SettingsProvider({
	children,
	categoriesEnabled,
	tagsEnabled,
	companiesEnabled,
}: SettingsProviderProps) {
	return (
		<SettingsContext.Provider value={{ categoriesEnabled, tagsEnabled, companiesEnabled }}>
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
		};
	}
	return context;
}
