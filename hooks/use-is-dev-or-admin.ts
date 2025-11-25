/**
 * Hook to determine if current user is in development mode or is an admin
 * Used for conditional error display and debugging features
 */

import { useSession } from 'next-auth/react';

export function useIsDevOrAdmin(): boolean {
	// Check if in development environment
	const isDevelopment = process.env.NODE_ENV === 'development';

	// Get session to check admin status
	const { data: session } = useSession();
	const isAdmin = session?.user?.isAdmin === true;

	return isDevelopment || isAdmin;
}
