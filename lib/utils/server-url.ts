import { siteConfig } from '../config';

const WEB_URL = siteConfig.url;

export async function getFrontendUrl(): Promise<string> {
	if (typeof window !== 'undefined') {
		return window.location.origin;
	}

	try {
		const { headers } = await import('next/headers');
		const headersList = await headers();
		const host = headersList.get('x-forwarded-host') || headersList.get('host');
		const protocol = headersList.get('x-forwarded-proto') || 'https';

		if (host) {
			return `${protocol}://${host}`;
		}
	} catch (e) {
		// This can happen in some edge cases during build/prerender
		console.warn('Failed to get headers in getFrontendUrl:', e);
	}

	return WEB_URL;
}
