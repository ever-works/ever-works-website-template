import { useConfig } from '@/app/[locale]/config';
import type { HeaderSettings } from '@/lib/content';

const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
	submitEnabled: true,
	pricingEnabled: true,
	layoutEnabled: true,
	languageEnabled: true,
	themeEnabled: true,
};

/**
 * Client-side hook to check header settings
 * Reads settings from ConfigContext (server-side fetched)
 * @returns HeaderSettings with loading and error states
 */
export function useHeaderSettings(): {
	settings: HeaderSettings;
	loading: boolean;
	error: Error | null;
} {
	const config = useConfig();

	// Use server-provided settings or defaults
	const settings = config.headerSettings ?? DEFAULT_HEADER_SETTINGS;

	return {
		settings,
		loading: false,
		error: null,
	};
}
