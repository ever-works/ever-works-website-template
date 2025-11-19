import { useEffect, useState } from 'react';

interface SettingsResponse {
	settings: {
		surveys_enabled?: boolean;
	};
}

/**
 * Client-side hook to check if surveys are enabled
 * Fetches the setting from the API and returns the current state
 * @returns boolean - true if surveys are enabled, false otherwise
 */
export function useSurveysEnabled(): {
	surveysEnabled: boolean;
	loading: boolean;
	error: Error | null;
} {
	const [surveysEnabled, setSurveysEnabled] = useState<boolean>(true);
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
				const enabled = data.settings?.surveys_enabled ?? true;
				setSurveysEnabled(enabled);
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Unknown error'));
				// Default to true on error (backward compatibility)
				setSurveysEnabled(true);
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, []);

	return { surveysEnabled, loading, error };
}
