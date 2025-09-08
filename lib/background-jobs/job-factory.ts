import { BackgroundJobManager } from './types';
import { LocalJobManager } from './local-job-manager';
import { getTriggerDevConfig, shouldUseTriggerDev } from './config';

/**
 * Create a job manager based on environment configuration
 * @returns Appropriate job manager implementation
 */
export function createJobManager(): BackgroundJobManager {
  const config = getTriggerDevConfig();
  
  if (shouldUseTriggerDev()) {
    console.log('🚀 Using Trigger.dev for background jobs');
    // TODO: Implement TriggerDevJobManager in Sub-ticket 3
    console.log('⚠️  Trigger.dev is enabled but not yet implemented, falling back to local manager');
    return new LocalJobManager();
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
