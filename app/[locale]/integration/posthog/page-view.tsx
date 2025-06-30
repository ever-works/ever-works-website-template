'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { POST_HOG_HOST, POST_HOG_KEY } from '@/lib/constants';

export default function PostHogPageView(): null {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	useEffect(() => {
		if (!POST_HOG_KEY.value || !POST_HOG_HOST.value) return;

		// Track pageviews
		if (pathname && posthog) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url = url + `?${searchParams.toString()}`;
			}
			posthog.capture('$pageview', {
				$current_url: url
			});
		}
	}, [pathname, searchParams, posthog]);

	return null;
}
