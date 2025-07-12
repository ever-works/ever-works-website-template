import * as Sentry from '@sentry/nextjs';
import { Replay } from '@sentry/replay';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') return;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Only enable debug mode in development and when explicitly enabled
    debug: process.env.NODE_ENV === 'development' && process.env.SENTRY_DEBUG === 'true',

    // Session replay configuration - reduce sampling in production
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Disable Sentry in development unless explicitly enabled
    enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLE_DEV === 'true',

    integrations: [
      new Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

// Add router transition instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart; 