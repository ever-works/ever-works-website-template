'use client';

import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next';
import { useEffect, useState } from 'react';


interface SpeedInsightsConfig {
	/**
	 * Enable/disable Speed Insights manually (optional)
	 * If not set, Speed Insights will auto-detect based on Vercel environment
	 * and feature availability
	 */
	enabled?: boolean;
	
	/**
	 * Sample rate for Speed Insights (0.0 to 1.0)
	 * Default: 1.0 (100% of page views)
	 * Useful for reducing data points on free tier
	 */
	sampleRate?: number;
}


export function SpeedInsights({ 
	enabled, 
	sampleRate 
}: SpeedInsightsConfig = {}) {
	const [shouldRender, setShouldRender] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [finalSampleRate, setFinalSampleRate] = useState<number>(1.0);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Client-side only check
		if (typeof window === 'undefined') {
			return;
		}

		// Prevent multiple initializations
		if (isInitialized) {
			return;
		}

		try {
			// Priority 1: Check if manually disabled
			if (enabled === false) {
				setShouldRender(false);
				setIsInitialized(true);
				return;
			}

			// Priority 2: Check environment variable if explicitly set
			const envEnabled = process.env.NEXT_PUBLIC_SPEED_INSIGHTS_ENABLED;
			if (envEnabled === 'false') {
				setShouldRender(false);
				setIsInitialized(true);
				return;
			}

			// Priority 3: Get sample rate from environment variable or prop (default: 1.0)
			const envSampleRate = process.env.NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE;
			const calculatedSampleRate = sampleRate ?? 
				(envSampleRate ? parseFloat(envSampleRate) : 1.0);
			
			// Validate sample rate (must be between 0 and 1)
			const validSampleRate = Math.max(0, Math.min(1, calculatedSampleRate));
			setFinalSampleRate(validSampleRate);

			// Priority 4: Check for Vercel Analytics ID (most reliable indicator)
			// This is set by Vercel ONLY when Speed Insights is enabled AND paid
			const vercelAnalyticsId = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID;

			// Priority 5: Check if we're on Vercel
			const isVercel = process.env.NEXT_PUBLIC_VERCEL === '1' || 
			                 process.env.VERCEL === '1' ||
			                 (typeof window !== 'undefined' && 
			                  (window.location.hostname.includes('vercel.app') || 
			                   window.location.hostname.includes('vercel.com')));
            
			if (enabled === true) {
				// Explicitly enabled - render it (VercelSpeedInsights will handle errors gracefully)
				setShouldRender(true);
			} else if (vercelAnalyticsId) {
				// Analytics ID present = Speed Insights is enabled and paid
				setShouldRender(true);
			} else if (isVercel && enabled === undefined) {
				// On Vercel but no explicit ID - be conservative
				// Only render if we're sure it's available (we can't be sure without the ID)
				// So we default to false to avoid errors
				setShouldRender(false);
			} else {
				// Not on Vercel or explicitly disabled
				setShouldRender(false);
			}

			setIsInitialized(true);
		} catch (err) {
			// Catch any errors during initialization
			console.warn('[SpeedInsights] Error during initialization:', err);
			setError(err instanceof Error ? err : new Error('Unknown error'));
			setShouldRender(false);
			setIsInitialized(true);
		}
	}, [enabled, sampleRate, isInitialized]);

	// Don't render if there was an error, not initialized, or explicitly disabled
	if (error || !isInitialized || !shouldRender) {
		return null;
	}

	// Apply sample rate if specified and less than 1.0
	// Note: Speed Insights has built-in sample rate support via props
	const props = finalSampleRate < 1.0 ? { sampleRate: finalSampleRate } : {};

	// Render Speed Insights component
	// VercelSpeedInsights handles errors gracefully internally and returns null
	// if the feature is not available or not paid/enabled
	return <VercelSpeedInsights {...props} />;
}

