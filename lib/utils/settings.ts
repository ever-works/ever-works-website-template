import { getNestedValue } from '@/lib/config-manager.server';

/**
 * Server-side utility to check if categories are enabled
 * @returns boolean - true if categories are enabled, false otherwise
 */
export async function getCategoriesEnabled(): Promise<boolean> {
	const categoriesEnabled = await getNestedValue('settings.categories_enabled');

	// Default to true if not set (backward compatibility)
	return categoriesEnabled ?? true;
}

/**
 * Server-side utility to check if tags are enabled
 * @returns boolean - true if tags are enabled, false otherwise
 */
export async function getTagsEnabled(): Promise<boolean> {
	const tagsEnabled = await getNestedValue('settings.tags_enabled');

	// Default to true if not set (backward compatibility)
	return tagsEnabled ?? true;
}

/**
 * Server-side utility to check if companies are enabled
 * @returns boolean - true if companies are enabled, false otherwise
 */
export async function getCompaniesEnabled(): Promise<boolean> {
	const companiesEnabled = await getNestedValue('settings.companies_enabled');

	// Default to true if not set (backward compatibility)
	return companiesEnabled ?? true;
}

/**
 * Server-side utility to check if surveys are enabled
 * @returns boolean - true if surveys are enabled, false otherwise
 */
export async function getSurveysEnabled(): Promise<boolean> {
	const surveysEnabled = await getNestedValue('settings.surveys_enabled');

	// Default to true if not set (backward compatibility)
	return surveysEnabled ?? true;
}

/**
 * Server-side utility to check if header submit button is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export async function getHeaderSubmitEnabled(): Promise<boolean> {
	const enabled = await getNestedValue('settings.header.submit_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header pricing menu is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export async function getHeaderPricingEnabled(): Promise<boolean> {
	const enabled = await getNestedValue('settings.header.pricing_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header layout switcher is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export async function getHeaderLayoutEnabled(): Promise<boolean> {
	const enabled = await getNestedValue('settings.header.layout_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header language selector is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export async function getHeaderLanguageEnabled(): Promise<boolean> {
	const enabled = await getNestedValue('settings.header.language_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header theme toggle is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export async function getHeaderThemeEnabled(): Promise<boolean> {
	const enabled = await getNestedValue('settings.header.theme_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to check if header more menu is enabled
 * @returns boolean - true if enabled, false otherwise
 */
export async function getHeaderMoreEnabled(): Promise<boolean> {
	const enabled = await getNestedValue('settings.header.more_enabled');
	return enabled ?? true;
}

/**
 * Server-side utility to get the default layout
 * @returns string - 'home1' or 'home2'
 */
export async function getHeaderLayoutDefault(): Promise<string> {
	const layoutDefault = await getNestedValue('settings.header.layout_default');
	return layoutDefault ?? 'home1';
}

/**
 * Server-side utility to get the default pagination type
 * @returns string - 'standard' or 'infinite'
 */
export async function getHeaderPaginationDefault(): Promise<string> {
	const paginationDefault = await getNestedValue('settings.header.pagination_default');
	return paginationDefault ?? 'standard';
}

/**
 * Server-side utility to get the default theme
 * @returns string - 'light' or 'dark'
 */
export async function getHeaderThemeDefault(): Promise<string> {
	const themeDefault = await getNestedValue('settings.header.theme_default');
	return themeDefault ?? 'light';
}
