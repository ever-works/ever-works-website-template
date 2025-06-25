'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { POST_HOG_HOST, POST_HOG_KEY } from '@/lib/constants';

const key = POST_HOG_KEY.value;
const host = POST_HOG_HOST.value;

if (typeof window !== 'undefined' && key && host) {
	posthog.init(key, {
		api_host: host,
		person_profiles: 'identified_only',
		capture_pageview: false,
		capture_pageleave: true
	});
}

export function PHProvider({ children }: { children: React.ReactNode }) {
		if (!key || !host) {return <>{children}</>}
	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
