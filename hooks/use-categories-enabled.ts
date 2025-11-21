import { useConfig } from '@/app/[locale]/config';

/**
 * Client-side hook to check if categories are enabled
 * Reads setting from ConfigContext (server-side fetched)
 * @returns boolean - true if categories are enabled, false otherwise
 */
export function useCategoriesEnabled(): {
	categoriesEnabled: boolean;
	loading: boolean;
	error: Error | null;
} {
	const config = useConfig();

	// Use server-provided setting or default to true
	const categoriesEnabled = config.categoriesEnabled ?? true;

	return {
		categoriesEnabled,
		loading: false,
		error: null,
	};
}
