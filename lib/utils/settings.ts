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
