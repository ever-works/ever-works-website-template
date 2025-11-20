'use client';

import { createContext, useContext, PropsWithChildren } from 'react';

interface SettingsContextValue {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	surveysEnabled: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps extends PropsWithChildren {
	categoriesEnabled: boolean;
	tagsEnabled: boolean;
	surveysEnabled: boolean;
}

export function SettingsProvider({
	children,
	categoriesEnabled,
	tagsEnabled,
	surveysEnabled,
}: SettingsProviderProps) {
	return (
		<SettingsContext.Provider value={{ categoriesEnabled, tagsEnabled, surveysEnabled }}>
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
		};
	}
	return context;
}
