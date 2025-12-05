'use server';

import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN, SENTRY_DEBUG, SENTRY_ENABLED } from '@/lib/constants';
import { initializeDatabase } from '@/lib/db/initialize';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Only initialize Sentry if DSN is configured
  if (SENTRY_DSN.value) {
    Sentry.init({
      dsn: SENTRY_DSN.value,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Only enable debug mode when explicitly enabled
      debug: SENTRY_DEBUG.value === 'true',
    });
  }

  // Auto-initialize database (migrate and seed if needed)
  // Note: Build-time migrations via scripts/build-migrate.ts are preferred for Vercel
  // This runtime migration serves as a fallback
  try {
    console.log('[Instrumentation] Running database initialization...');
    await initializeDatabase();
    console.log('[Instrumentation] Database initialization completed');
  } catch (error) {
    console.error('[Instrumentation] Database initialization failed:', error);
    // Log detailed error for debugging in Vercel logs
    if (error instanceof Error) {
      console.error('[Instrumentation] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    // Don't throw - allow app to start even if DB init fails
    // The app will return errors for DB-dependent routes
  }
}

// Add hook to capture errors from React Server Components
export const onRequestError = Sentry.captureRequestError;
