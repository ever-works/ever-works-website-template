/**
 * Hook to determine if current user is in development mode or is an admin
 * Used for conditional error display and debugging features
 */

import { useCurrentUser } from './use-current-user';

export function useIsDevOrAdmin(): boolean {
	// Check if in development environment
	const isDevelopment = process.env.NODE_ENV === 'development';

	// Get user to check admin status (reuses existing /api/current-user cache)
	const { user } = useCurrentUser();
	const isAdmin = user?.isAdmin === true;

	return isDevelopment || isAdmin;
}
