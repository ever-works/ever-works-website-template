import 'server-only';

import { headers } from 'next/headers';
import { siteConfig } from '../config';

const WEB_URL = siteConfig.url;

export async function getFrontendUrl(): Promise<string> {
	const headersList = await headers();
	const host = headersList.get('x-forwarded-host') || headersList.get('host');
	const protocol = headersList.get('x-forwarded-proto') || 'https';
	if (host) {
		return `${protocol}://${host}`;
	}
	return WEB_URL;
}
