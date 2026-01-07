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

/**
 * Waits for the browser to complete rendering and become idle
 * Uses requestIdleCallback when available, falls back to requestAnimationFrame
 */
function waitForRenderComplete(): Promise<void> {
	return new Promise((resolve) => {
		if (typeof requestIdleCallback !== 'undefined') {
			requestIdleCallback(() => resolve(), { timeout: 200 });
		} else {
			requestAnimationFrame(() => resolve());
		}
	});
}

export function NavigationProvider({ children }: NavigationProviderProps) {
	// isInitialLoad remains true until first client-side navigation occurs
	// This allows pages to show skeletons during their initial data loading
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [isNavigating, setIsNavigating] = useState(false);
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();
	const previousPathname = useRef<string | null>(null);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

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
				setIsInitialLoad(false);
			}

			setIsNavigating(true);
			previousPathname.current = pathname;

			// Wait for the new page to render before clearing navigation state
			waitForRenderComplete().then(() => {
				if (isMounted.current) {
					startTransition(() => {
						setIsNavigating(false);
					});
				}
			});
		}
	}, [pathname, isInitialLoad]);

	// Combine transition pending state with our navigation state
	const actuallyNavigating = isNavigating || isPending;

	return (
		<NavigationContext.Provider value={{ isInitialLoad, isNavigating: actuallyNavigating }}>
			{children}
		</NavigationContext.Provider>
	);
}
