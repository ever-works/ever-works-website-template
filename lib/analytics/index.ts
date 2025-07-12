import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';
import { POST_HOG_HOST, POST_HOG_KEY } from '@/lib/constants';

type EventProperties = Record<string, any>;
type UserProperties = Record<string, any>;

export class Analytics {
  private static instance: Analytics;
  private initialized = false;

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  init() {
    if (this.initialized) return;
    
    const posthogKey = POST_HOG_KEY.value;
    const posthogHost = POST_HOG_HOST.value;

    if (typeof window !== 'undefined' && posthogKey && posthogHost) {
      // Initialize PostHog
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // We handle this manually
        capture_pageleave: true,
        enable_recording_console_log: true,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: "[data-mask]",
        },
        mask_all_element_attributes: false,
        mask_all_text: false,
      });

      // Link PostHog with Sentry
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        posthog.sentry = Sentry;
      }
    }

    this.initialized = true;
  }

  // User Identification and Properties
  identify(userId: string, properties?: UserProperties) {
    if (!this.initialized) return;
    posthog?.identify(userId, properties);
    Sentry.setUser({ id: userId, ...properties });
  }

  reset() {
    if (!this.initialized) return;
    posthog?.reset();
    Sentry.setUser(null);
  }

  // Event Tracking
  track(eventName: string, properties?: EventProperties) {
    if (!this.initialized) return;
    posthog?.capture(eventName, properties);
  }

  // Page Views
  trackPageView(url: string, properties?: EventProperties) {
    if (!this.initialized) return;
    posthog?.capture('$pageview', {
      $current_url: url,
      ...properties,
    });
  }

  // Feature Flags
  isFeatureEnabled(flagKey: string, defaultValue = false): boolean {
    if (!this.initialized) return defaultValue;
    return posthog?.isFeatureEnabled(flagKey) ?? defaultValue;
  }

  async reloadFeatureFlags(): Promise<void> {
    if (!this.initialized) return;
    await posthog?.reloadFeatureFlags();
  }

  // Error Tracking
  captureError(error: Error, context?: Record<string, any>) {
    if (!this.initialized) return;
    
    // Send to PostHog
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });

    // Send to Sentry
    Sentry.captureException(error, {
      extra: context,
    });
  }

  // User Properties
  setUserProperties(properties: UserProperties) {
    if (!this.initialized) return;
    posthog?.people.set(properties);
  }

  // Super Properties (properties sent with every event)
  setSuperProperties(properties: Record<string, any>) {
    if (!this.initialized) return;
    posthog?.register(properties);
  }
}

export const analytics = Analytics.getInstance(); 