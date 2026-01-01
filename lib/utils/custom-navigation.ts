/**
 * Utility functions for custom navigation links
 */

/**
 * Checks if a URL is external (starts with http:// or https://)
 */
export function isExternalUrl(path: string): boolean {
	return /^https?:\/\//i.test(path);
}

/**
 * Resolves a label, supporting both plain text and i18n translation keys
 * Translation keys are detected by checking if they contain uppercase letters and underscores (e.g., "NAV_ABOUT")
 * Supports both direct keys (e.g., "NAV_ABOUT") and namespaced keys (e.g., "common.NAV_ABOUT")
 * Falls back to the original label if translation is not found
 *
 * @param label - The label to resolve (can be plain text or translation key)
 * @param t - Translation function from useTranslations() (without namespace parameter)
 */
export function resolveLabel(label: string, t: (key: string) => string): string {
	// Check if label contains a dot (namespace.key format like "footer.PRIVACY_POLICY")
	const hasNamespace = label.includes('.');

	if (hasNamespace) {
		// Try the key with namespace directly (e.g., "footer.PRIVACY_POLICY")
		try {
			const translated = t(label);
			// Check that we got a valid translation (not the key itself, not missing message)
			if (translated && translated !== label && !translated.includes('MISSING_MESSAGE')) {
				return translated;
			}
		} catch (error) {
			// Translation not found, continue to fallback
		}
	}

	// Check if label looks like a translation key (contains uppercase and underscores)
	// Pattern: starts with uppercase, contains only uppercase letters, numbers, and underscores
	// Or if it has a namespace, extract the key part after the dot
	const keyPart = hasNamespace ? label.split('.').pop() || label : label;
	const looksLikeTranslationKey = /^[A-Z][A-Z0-9_]*$/.test(keyPart);

	if (!looksLikeTranslationKey) {
		// Not a translation key, return as-is
		return label;
	}

	// Try common namespaces in order of likelihood
	const namespaces = ['common', 'footer', 'auth', 'listing', 'survey', 'help'];

	for (const ns of namespaces) {
		try {
			const key = `${ns}.${keyPart}`;
			const translated = t(key);

			// next-intl returns the key itself if translation doesn't exist
			// Also check if it's the same as the key or contains the namespace prefix (missing translation)
			if (
				translated &&
				translated !== key &&
				!translated.startsWith(`${ns}.`) &&
				!translated.includes('MISSING_MESSAGE')
			) {
				return translated;
			}
		} catch (error) {
			// Translation key doesn't exist, continue to next namespace
			continue;
		}
	}

	// Try the key directly (without namespace) as last resort
	try {
		const translated = t(keyPart);
		// Check that we got a valid translation (not the key itself, not missing message)
		if (
			translated &&
			translated !== keyPart &&
			!translated.includes('.') &&
			!translated.includes('MISSING_MESSAGE')
		) {
			return translated;
		}
	} catch (error) {
		// Translation not found - will fall back to original label
	}

	// Return original label if translation not found
	return label;
}
