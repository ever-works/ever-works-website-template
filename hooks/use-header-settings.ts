import { useEffect, useState } from 'react';

interface HeaderSettings {
	submitEnabled: boolean;
	pricingEnabled: boolean;
	layoutEnabled: boolean;
	languageEnabled: boolean;
	themeEnabled: boolean;
}

interface SettingsResponse {
	settings: {
		header_submit_enabled?: boolean;
		header_pricing_enabled?: boolean;
		header_layout_enabled?: boolean;
		header_language_enabled?: boolean;
		header_theme_enabled?: boolean;
	};
}

/**
 * Client-side hook to check header settings
 * Fetches settings from the API and returns the current state
 * @returns HeaderSettings with loading and error states
 */
export function useHeaderSettings(): {
	settings: HeaderSettings;
	loading: boolean;
	error: Error | null;
} {
	const [settings, setSettings] = useState<HeaderSettings>({
		submitEnabled: true,
		pricingEnabled: true,
		layoutEnabled: true,
		languageEnabled: true,
		themeEnabled: true,
	});
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
				setSettings({
					submitEnabled: data.settings?.header_submit_enabled ?? true,
					pricingEnabled: data.settings?.header_pricing_enabled ?? true,
					layoutEnabled: data.settings?.header_layout_enabled ?? true,
					languageEnabled: data.settings?.header_language_enabled ?? true,
					themeEnabled: data.settings?.header_theme_enabled ?? true,
				});
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Unknown error'));
				// Default to true on error (backward compatibility)
				setSettings({
					submitEnabled: true,
					pricingEnabled: true,
					layoutEnabled: true,
					languageEnabled: true,
					themeEnabled: true,
				});
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, []);

	return { settings, loading, error };
}
