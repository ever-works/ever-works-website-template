'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
	isInitialLoad: boolean;
	isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error('useNavigation must be used within NavigationProvider');
	}
	return context;
}

interface NavigationProviderProps {
	children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
	// Track if this is the initial page load
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [isNavigating, setIsNavigating] = useState(false);
	const pathname = usePathname();
	const previousPathname = useRef<string | null>(null);
	const hasHydrated = useRef(false);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		// Mark as hydrated on first mount
		if (!hasHydrated.current) {
			hasHydrated.current = true;
			previousPathname.current = pathname;

			// After initial render, mark initial load as complete
			// Small delay to ensure skeleton renders first
			const timer = setTimeout(() => {
				if (isMounted.current) setIsInitialLoad(false);
			}, 100);

			return () => {
				clearTimeout(timer);
				if (isMounted.current) setIsInitialLoad(false);
			};
		}

		// Check if pathname actually changed (client-side navigation)
		if (previousPathname.current !== pathname) {
			setIsNavigating(true);
			previousPathname.current = pathname;

			// Reset navigating state after a short delay
			// This gives time for the new page to render
			const timer = setTimeout(() => {
				if (isMounted.current) setIsNavigating(false);
			}, 300);

			return () => {
				clearTimeout(timer);
				if (isMounted.current) setIsNavigating(false);
			};
		}
	}, [pathname]);

	return <NavigationContext.Provider value={{ isInitialLoad, isNavigating }}>{children}</NavigationContext.Provider>;
}
