import { syncManager } from '@/lib/services/sync-service';
import { getJobManager } from '@/lib/background-jobs';
import { SyncTaskIds } from '@/lib/background-jobs/triggers/sync';

// Job interval constant
const SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds

/**
 * Initialize and register the repository sync background job
 * This delegates scheduling to BackgroundJobManager which handles:
 * - Local scheduling (setInterval) in development
 * - Trigger.dev scheduling in production
 */
export function initializeRepositorySyncJob(): void {
  const jobManager = getJobManager();

  jobManager.scheduleJob(
    SyncTaskIds.repoSync,
    'Repository Synchronization',
    async () => {
      // Delegate to SyncManager which handles:
      // - Timeout wrapper
      // - Retry logic
      // - Mutex lock
      // - Status tracking
      return await syncManager.performSync();
    },
    SYNC_INTERVAL_MS
  );

  console.log('[REPOSITORY_SYNC] Job registered with BackgroundJobManager (60s interval)');
}
