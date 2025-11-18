import { useEffect, useState } from 'react';

interface SettingsResponse {
	settings: {
		categories_enabled?: boolean;
	};
}

/**
 * Client-side hook to check if categories are enabled
 * Fetches the setting from the API and returns the current state
 * @returns boolean - true if categories are enabled, false otherwise
 */
export function useCategoriesEnabled(): {
	categoriesEnabled: boolean;
	loading: boolean;
	error: Error | null;
} {
	const [categoriesEnabled, setCategoriesEnabled] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch('/api/admin/settings');

				if (!response.ok) {
					throw new Error('Failed to fetch settings');
				}

				const data: SettingsResponse = await response.json();

				// Default to true if not set (backward compatibility)
				const enabled = data.settings?.categories_enabled ?? true;
				setCategoriesEnabled(enabled);
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Unknown error'));
				// Default to true on error (backward compatibility)
				setCategoriesEnabled(true);
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, []);

	return { categoriesEnabled, loading, error };
}
