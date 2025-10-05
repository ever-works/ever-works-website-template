/**
 * Centralized site configuration for template customization
 *
 * This file provides a single source of truth for site-wide settings
 * that template users need to customize for their own directory.
 *
 * All values can be overridden via environment variables in .env.local
 */

export const siteConfig = {
	/**
	 * Site name displayed in metadata, OG images, and schemas
	 * @example "My Directory", "Awesome Tools", "Best Services"
	 */
	name: process.env.NEXT_PUBLIC_SITE_NAME || 'Ever Works',

	/**
	 * Site tagline/description for branding
	 * Used in default OG images and homepage
	 * @example "Find the Best Tools", "Professional Services Directory"
	 */
	tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'The Open-Source, AI-Powered Directory Builder',

	/**
	 * Full site URL (required for metadata, OG images, sitemaps)
	 * Should NOT include trailing slash
	 * @example "https://mydirectory.com"
	 */
	url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ever.works',

	/**
	 * Site logo path (used as fallback for OG images)
	 * Path should be relative to /public directory
	 * @example "/logo.svg", "/images/brand.png"
	 */
	logo: process.env.NEXT_PUBLIC_SITE_LOGO || '/logo-ever-works.svg',

	/**
	 * Brand name for schema.org Organization markup
	 * Can be same as site name or parent company name
	 * @example "My Company LLC"
	 */
	brandName: process.env.NEXT_PUBLIC_BRAND_NAME || 'Ever Works',

	/**
	 * Site description for SEO metadata
	 * Keep under 160 characters for optimal display
	 */
	description:
		process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
		'Discover and explore professional services and solutions on Ever Works',

	/**
	 * OG image theme colors (for dynamic image generation)
	 * Uses CSS gradient format
	 */
	ogImage: {
		gradientStart: process.env.NEXT_PUBLIC_OG_GRADIENT_START || '#667eea',
		gradientEnd: process.env.NEXT_PUBLIC_OG_GRADIENT_END || '#764ba2'
	}
} as const;

/**
 * Validation helper to check if required config is present
 * Useful for build-time checks
 */
export function validateSiteConfig() {
	const warnings: string[] = [];

	if (!process.env.NEXT_PUBLIC_SITE_URL) {
		warnings.push('NEXT_PUBLIC_SITE_URL not set, using default. Set this for production!');
	}

	if (!process.env.NEXT_PUBLIC_SITE_NAME) {
		warnings.push('NEXT_PUBLIC_SITE_NAME not set, using "Ever Works". Customize for your brand!');
	}

	if (warnings.length > 0) {
		console.warn('⚠️  Site Configuration Warnings:');
		warnings.forEach((warning) => console.warn(`   - ${warning}`));
		console.warn('   See .env.example for all customization options.\n');
	}

	return warnings.length === 0;
}
