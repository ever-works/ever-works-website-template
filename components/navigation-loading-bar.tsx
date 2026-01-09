'use client';

import { useNavigation } from './providers';
import { TopLoadingBar } from './ui/top-loading-bar';

/**
 * Global navigation loading bar
 * Shows a thin loading bar at the top during client-side navigation
 * Note: Currently disabled as NavigationProvider doesn't track navigation state
 * TODO: Implement proper navigation state tracking in NavigationProvider
 */
export function NavigationLoadingBar() {
	// NavigationProvider currently only tracks isInitialLoad/showSkeleton
	// isNavigating is not implemented - return false to disable loading bar
	const { showSkeleton } = useNavigation();

	// For now, don't show loading bar as we don't have proper navigation state
	return <TopLoadingBar isLoading={showSkeleton} />;
}
