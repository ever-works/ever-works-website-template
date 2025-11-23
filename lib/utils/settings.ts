import { configManager } from '@/lib/config-manager';

/**
 * Server-side utility to check if categories are enabled
 * @returns boolean - true if categories are enabled, false otherwise
 */
export function getCategoriesEnabled(): boolean {
	const categoriesEnabled = configManager.getNestedValue('settings.categories_enabled');

	// Default to true if not set (backward compatibility)
	return categoriesEnabled ?? true;
}

/**
 * Server-side utility to check if tags are enabled
 * @returns boolean - true if tags are enabled, false otherwise
 */
export function getTagsEnabled(): boolean {
	const tagsEnabled = configManager.getNestedValue('settings.tags_enabled');

	// Default to true if not set (backward compatibility)
	return tagsEnabled ?? true;
}

/**
 * Server-side utility to check if surveys are enabled
 * @returns boolean - true if surveys are enabled, false otherwise
 */
export function getSurveysEnabled(): boolean {
	const surveysEnabled = configManager.getNestedValue('settings.surveys_enabled');

	// Default to true if not set (backward compatibility)
	return surveysEnabled ?? true;
}

/**
 * Server-side utility to check if header submit button is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderSubmitEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header_submit_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header pricing menu is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderPricingEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header_pricing_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header layout switcher is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderLayoutEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header_layout_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header language selector is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderLanguageEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header_language_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header theme toggle is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderThemeEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header_theme_enabled');
	return enabled ?? true;
}
