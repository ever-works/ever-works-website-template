'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useTransition } from 'react';
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
	// isInitialLoad remains true until first client-side navigation occurs
	// This allows pages to show skeletons during their initial data loading
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();
	const previousPathname = useRef<string | null>(null);

	useEffect(() => {
		// On first render, just track the pathname
		if (previousPathname.current === null) {
			previousPathname.current = pathname;
			return;
		}

		// Detect client-side navigation (pathname changed)
		if (previousPathname.current !== pathname) {
			// First navigation marks the end of initial load
			if (isInitialLoad) {
				startTransition(() => {
					setIsInitialLoad(false);
				});
			}

			previousPathname.current = pathname;
		}
	}, [pathname, isInitialLoad]);

	// isNavigating is derived from React's transition state
	// This automatically tracks when React is processing updates,
	// which includes navigation and rendering of new content
	// Pages should use their own loading states (isLoading, isPending) for data-specific indicators
	const isNavigating = isPending;

	return <NavigationContext.Provider value={{ isInitialLoad, isNavigating }}>{children}</NavigationContext.Provider>;
}
