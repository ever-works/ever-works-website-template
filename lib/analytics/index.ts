import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';
import type { Event as SentryEvent } from '@sentry/nextjs';
import {
    POSTHOG_KEY,
    POSTHOG_HOST,
    POSTHOG_ENABLED,
    POSTHOG_DEBUG,
    POSTHOG_SESSION_RECORDING_ENABLED,
    POSTHOG_AUTO_CAPTURE,
    POSTHOG_SAMPLE_RATE,
    POSTHOG_SESSION_RECORDING_SAMPLE_RATE,
    SENTRY_ENABLED,
} from '@/lib/constants';

type EventProperties = Record<string, any>;
type UserProperties = Record<string, any>;

// Extend PostHog type to include Sentry integration
declare module 'posthog-js' {
  interface PostHog {
    sentry?: typeof Sentry;
  }
}

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
    
    const posthogKey = POSTHOG_KEY.value;
    const posthogHost = POSTHOG_HOST.value;
    
    if (typeof window !== 'undefined' && POSTHOG_ENABLED && posthogKey && posthogHost) {
      // Initialize PostHog with centralized configuration
      const config: posthog.Config = {
        api_host: posthogHost,
        debug: POSTHOG_DEBUG.value === 'true',
        persistence: 'localStorage',
        person_profiles: 'identified_only',
        capture_pageview: POSTHOG_AUTO_CAPTURE.value === 'true',
        capture_pageleave: true,
        enable_recording_console_log: POSTHOG_DEBUG.value === 'true',
        mask_all_element_attributes: false,
        mask_all_text: false,
        sample_rate: POSTHOG_SAMPLE_RATE,
      };

      // Add session recording if enabled
      if (POSTHOG_SESSION_RECORDING_ENABLED.value === 'true') {
        config.session_recording = {
          maskAllInputs: true,
          maskTextSelector: "[data-mask]",
          sampleRate: POSTHOG_SESSION_RECORDING_SAMPLE_RATE,
        };
      }

      // Initialize PostHog
      posthog.init(posthogKey, config);

      // Link PostHog with Sentry if both are enabled
      if (SENTRY_ENABLED) {
        // Set up Sentry integration
        posthog.sentry = Sentry;
        
        // Configure Sentry to send events to PostHog
        Sentry.addIntegration({
          name: 'PostHog',
          setupOnce() {
            Sentry.addEventProcessor((event: SentryEvent) => {
              if (event.user) {
                posthog.capture('sentry_error', {
                  error: event.message,
                  error_id: event.event_id,
                  error_type: event.type,
                  error_context: event.contexts,
                  error_tags: event.tags,
                });
              }
              return event;
            });
          },
        });
      }
    }

    this.initialized = true;
  }

  // User Identification and Properties
  identify(userId: string, properties?: UserProperties) {
    if (!this.initialized || !POSTHOG_ENABLED) return;
    posthog?.identify(userId, properties);
    if (SENTRY_ENABLED) {
      Sentry.setUser({ id: userId, ...properties });
    }
  }

  reset() {
    if (!this.initialized || !POSTHOG_ENABLED) return;
    posthog?.reset();
    if (SENTRY_ENABLED) {
      Sentry.setUser(null);
    }
  }

  // Event Tracking
  track(eventName: string, properties?: EventProperties) {
    if (!this.initialized || !POSTHOG_ENABLED) return;
    posthog?.capture(eventName, properties);
  }

  // Page Views
  trackPageView(url: string, properties?: EventProperties) {
    if (!this.initialized || !POSTHOG_ENABLED) return;
    posthog?.capture('$pageview', {
      $current_url: url,
      ...properties,
    });
  }

  // Feature Flags
  isFeatureEnabled(flagKey: string, defaultValue = false): boolean {
    if (!this.initialized || !POSTHOG_ENABLED) return defaultValue;
    return posthog?.isFeatureEnabled(flagKey) ?? defaultValue;
  }

  async reloadFeatureFlags(): Promise<void> {
    if (!this.initialized || !POSTHOG_ENABLED) return;
    await posthog?.reloadFeatureFlags();
  }

  // Error Tracking
  captureError(error: Error, context?: Record<string, any>) {
    if (!this.initialized) return;
    
    // Send to PostHog if enabled
    if (POSTHOG_ENABLED) {
      this.track('error', {
        message: error.message,
        stack: error.stack,
        ...context,
      });
    }

    // Send to Sentry if enabled
    if (SENTRY_ENABLED) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  // User Properties
  setUserProperties(properties: UserProperties) {
    if (!this.initialized || !POSTHOG_ENABLED) return;
    posthog?.people.set(properties);
  }

  // Super Properties (properties sent with every event)
  setSuperProperties(properties: Record<string, any>) {
    if (!this.initialized || !POSTHOG_ENABLED) return;
    posthog?.register(properties);
  }
}

export const analytics = Analytics.getInstance(); 