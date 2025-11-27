import { TriggerDevConfig, SchedulingMode } from './types';

/**
 * Get Trigger.dev configuration from environment variables
 * @returns Trigger.dev configuration object
 */
export function getTriggerDevConfig(): TriggerDevConfig {
  const apiKey = process.env.TRIGGER_DEV_API_KEY;
  const apiUrl = process.env.TRIGGER_DEV_API_URL || 'https://api.trigger.dev';
  const enabledRaw = process.env.TRIGGER_DEV_ENABLED?.toLowerCase()?.trim();
  const enabled = ['1', 'true', 'yes', 'on'].includes(enabledRaw || '');
  const environment = process.env.TRIGGER_DEV_ENVIRONMENT || 'development';
  
  return {
    enabled,
    apiKey,
    apiUrl,
    environment,
    isFullyConfigured: !!(apiKey && apiUrl),
    isPartiallyConfigured: !!(apiKey || apiUrl) && !(apiKey && apiUrl)
  };
}

/**
 * Determine if Trigger.dev should be used based on configuration
 * @returns True if Trigger.dev should be used
 */
export function shouldUseTriggerDev(): boolean {
  const config = getTriggerDevConfig();
  return config.isFullyConfigured &&
         config.enabled &&
         process.env.NODE_ENV === 'production';
}

/**
 * Check if running in Vercel environment
 * @returns True if running on Vercel
 */
export function isVercelEnvironment(): boolean {
  return process.env.VERCEL === '1';
}

/**
 * Determine which scheduling mode should be used
 * Priority order:
 * 1. Disabled - if DISABLE_AUTO_SYNC is true
 * 2. Trigger.dev - if fully configured and enabled in production
 * 3. Vercel - if running on Vercel platform
 * 4. Local - fallback for all other environments
 *
 * @returns The scheduling mode to use
 */
export function getSchedulingMode(): SchedulingMode {
  // Check if auto-sync is disabled
  const disableAutoSync = process.env.DISABLE_AUTO_SYNC?.toLowerCase()?.trim();
  if (['1', 'true', 'yes', 'on'].includes(disableAutoSync || '')) {
    return 'disabled';
  }

  // Priority 1: Trigger.dev (production only)
  if (shouldUseTriggerDev()) {
    return 'trigger-dev';
  }

  // Priority 2: Vercel cron
  if (isVercelEnvironment()) {
    return 'vercel';
  }

  // Priority 3: Local fallback
  return 'local';
}
