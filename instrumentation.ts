'use server';

import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN, SENTRY_DEBUG, SENTRY_ENABLED } from '@/lib/constants';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Initialize Sentry if enabled
  if (SENTRY_ENABLED) {
    Sentry.init({
      dsn: SENTRY_DSN.value,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Only enable debug mode when explicitly enabled
      debug: SENTRY_DEBUG.value === 'true',
    });
  }

  // Initialize database (auto-seed if needed)
  try {
    const { initializeDatabase } = await import('@/lib/db/initialize');
    await initializeDatabase();
  } catch (error) {
    console.error('[Instrumentation] Database initialization error:', error);
    // Re-throw to prevent server startup if DB is configured but initialization fails
    throw error;
  }
}

// Add hook to capture errors from React Server Components
export const onRequestError = Sentry.captureRequestError; 