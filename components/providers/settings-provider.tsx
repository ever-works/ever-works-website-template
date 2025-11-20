'use client';

import { createContext, useContext, PropsWithChildren } from 'react';

interface SettingsContextValue {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps extends PropsWithChildren {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
}

export function SettingsProvider({
	children,
	categoriesEnabled,
	tagsEnabled,
}: SettingsProviderProps) {
	return (
		<SettingsContext.Provider value={{ categoriesEnabled, tagsEnabled }}>
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
		};
	}
	return context;
}
