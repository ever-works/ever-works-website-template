'use client';

import { useNavigation } from './providers';
import { TopLoadingBar } from './ui/top-loading-bar';

/**
 * Global navigation loading bar
 * Shows a thin loading bar at the top during client-side navigation
 * Replaces skeleton screens for better UX
 */
export function NavigationLoadingBar() {
	const { isNavigating } = useNavigation();

	return <TopLoadingBar isLoading={isNavigating} />;
}
