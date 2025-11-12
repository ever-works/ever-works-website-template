import { BackgroundJobManager } from './types';
import { LocalJobManager } from './local-job-manager';
import { TriggerDevJobManager } from './trigger-dev-job-manager';
import { NoOpJobManager } from './noop-job-manager';
import { getTriggerDevConfig, shouldUseTriggerDev } from './config';

/**
 * Create a job manager based on environment configuration
 * @returns Appropriate job manager implementation
 */
export function createJobManager(): BackgroundJobManager {
  // Skip background jobs in development mode for better performance
  if (process.env.NODE_ENV === 'development') {
    console.log('⏭️  Skipping background jobs in development mode');
    return new NoOpJobManager();
  }

  const config = getTriggerDevConfig();

  if (shouldUseTriggerDev()) {
    console.log(`🚀 Using Trigger.dev for background jobs (env: ${config.environment}, url: ${config.apiUrl})`);
    return new TriggerDevJobManager(config);
  }

  if (config.isPartiallyConfigured) {
    console.warn('⚠️  Trigger.dev partially configured, using local scheduling');
  } else {
    console.log('📝 Using local scheduling (Trigger.dev not configured)');
  }

  return new LocalJobManager();
}

// Singleton instance
let jobManagerInstance: BackgroundJobManager | null = null;

/**
 * Get the singleton job manager instance
 * @returns Job manager instance
 */
export function getJobManager(): BackgroundJobManager {
  if (!jobManagerInstance) {
    jobManagerInstance = createJobManager();
  }
  return jobManagerInstance;
}

/**
 * Reset the job manager instance (useful for testing)
 */
export function resetJobManager(): void {
  if (jobManagerInstance) {
    jobManagerInstance.stopAllJobs();
    jobManagerInstance = null;
  }
}
