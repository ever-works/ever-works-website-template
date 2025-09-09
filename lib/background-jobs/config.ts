import { TriggerDevConfig } from './types';

/**
 * Get Trigger.dev configuration from environment variables
 * @returns Trigger.dev configuration object
 */
export function getTriggerDevConfig(): TriggerDevConfig {
  const apiKey = process.env.TRIGGER_DEV_API_KEY;
  const apiUrl = process.env.TRIGGER_DEV_API_URL;
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
