/**
 * Centralized background job initialization
 *
 * This module handles registration of all background jobs with BackgroundJobManager.
 * Uses dynamic imports to prevent webpack from bundling Node.js modules.
 */

// Singleton guard to prevent multiple initializations
let isInitialized = false;

export async function initializeBackgroundJobs(): Promise<void> {
  // Skip during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  // Singleton guard - only initialize once per process
  if (isInitialized) {
    return;
  }

  isInitialized = true;
  // Lazy-load BackgroundJobManager to avoid static analysis issues
  const { getJobManager } = await import('@/lib/background-jobs');
  const manager = getJobManager();

  // Register repository sync job
  // Note: Uses dynamic import inside callback to prevent webpack from analyzing
  // the sync-service -> repository -> isomorphic-git chain at build time
  manager.scheduleJob(
    'repository-sync',
    'Repository Synchronization',
    async () => {
      // Dynamic import prevents webpack bundling of Node.js modules
      const { syncManager } = await import('@/lib/services/sync-service');

      // SyncManager handles:
      // - Timeout wrapper
      // - Retry logic
      // - Mutex lock
      // - Status tracking
      await syncManager.performSync();
    },
    60 * 1000 // 60 seconds interval
  );

  console.log('[BACKGROUND_JOBS] Repository sync job registered with BackgroundJobManager');
}
