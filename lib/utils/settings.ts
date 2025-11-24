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
 * Server-side utility to check if companies are enabled
 * @returns boolean - true if companies are enabled, false otherwise
 */
export function getCompaniesEnabled(): boolean {
	const companiesEnabled = configManager.getNestedValue('settings.companies_enabled');

	// Default to true if not set (backward compatibility)
	return companiesEnabled ?? true;
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
	const enabled = configManager.getNestedValue('settings.header.submit_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header pricing menu is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderPricingEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header.pricing_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header layout switcher is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderLayoutEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header.layout_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header language selector is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderLanguageEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header.language_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header theme toggle is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderThemeEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header.theme_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header more menu is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export function getHeaderMoreEnabled(): boolean {
	const enabled = configManager.getNestedValue('settings.header.more_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to get the default layout
 * @returns string - 'home1' or 'home2'
 */
export function getHeaderLayoutDefault(): string {
	const layoutDefault = configManager.getNestedValue('settings.header.layout_default');
	return layoutDefault ?? 'home1';
}

/**
 * Server-side utility to get the default pagination type
 * @returns string - 'standard' or 'infinite'
 */
export function getHeaderPaginationDefault(): string {
	const paginationDefault = configManager.getNestedValue('settings.header.pagination_default');
	return paginationDefault ?? 'standard';
}

/**
 * Server-side utility to get the default theme
 * @returns string - 'light' or 'dark'
 */
export function getHeaderThemeDefault(): string {
	const themeDefault = configManager.getNestedValue('settings.header.theme_default');
	return themeDefault ?? 'light';
}
