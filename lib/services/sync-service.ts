import 'server-only';

import { trySyncRepository } from "@/lib/repository";

// Types
export type SyncResult = {
  success: boolean;
  message: string;
  details?: string;
  duration?: number;
};

export interface SyncStatus {
  isRunning: boolean;
  lastSyncTime: Date | null;
  lastSyncResult: SyncResult | null;
  nextSyncTime: Date | null;
}

// Configuration
const SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds
const SYNC_TIMEOUT_MS = 5 * 60 * 1000; // 5 minute timeout
const MAX_RETRIES = 3;

/**
 * Singleton sync manager that handles automatic background synchronization
 * Runs git repository sync every 60 seconds without blocking requests
 */
class SyncManager {
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private lastSyncResult: SyncResult | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;

  /**
   * Start automatic background sync on server startup
   * Performs immediate first sync, then runs every 60 seconds
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      console.log('[SYNC_MANAGER] Auto-sync already running');
      return;
    }

    console.log(`[SYNC_MANAGER] Starting auto-sync with ${SYNC_INTERVAL_MS}ms interval`);

    // Immediate first sync
    this.performSync();

    // Schedule periodic syncs
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Stop automatic sync (for cleanup)
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SYNC_MANAGER] Auto-sync stopped');
    }
  }

  /**
   * Perform a single sync operation with mutex lock and timeout
   */
  async performSync(): Promise<SyncResult> {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      console.log('[SYNC_MANAGER] Sync already in progress, skipping');
      return {
        success: false,
        message: 'Sync already in progress',
        details: 'Skipped to prevent concurrent sync operations'
      };
    }

    this.syncInProgress = true;
    const startTime = Date.now();

    try {
      console.log('[SYNC_MANAGER] Starting background repository sync');

      // Timeout wrapper
      const syncPromise = trySyncRepository();
      let timeoutHandle: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('Sync timeout')), SYNC_TIMEOUT_MS);
      });

      await Promise.race([syncPromise, timeoutPromise]);
      clearTimeout(timeoutHandle!);

      // Success
      const duration = Date.now() - startTime;
      this.lastSyncTime = new Date();
      this.retryCount = 0;

      const result: SyncResult = {
        success: true,
        message: 'Repository synchronized successfully',
        details: `Sync completed in ${duration}ms`,
        duration
      };

      this.lastSyncResult = result;

      console.log(`[SYNC_MANAGER] Sync completed successfully in ${duration}ms`);

      // TODO: Cache invalidation will be added in PR #2 (caching implementation)
      // revalidateTag() requires request context, which doesn't exist in background sync
      // For now, content is read fresh from disk on each request, so no stale cache to invalidate

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';

      console.error(`[SYNC_MANAGER] Sync failed after ${duration}ms:`, error);

      const result: SyncResult = {
        success: false,
        message: 'Repository synchronization failed',
        details: `${errorMessage} (attempt ${this.retryCount + 1}/${MAX_RETRIES})`,
        duration
      };

      this.lastSyncResult = result;

      // Retry logic
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        console.log(`[SYNC_MANAGER] Scheduling retry ${this.retryCount}/${MAX_RETRIES} in 10 seconds`);
        setTimeout(() => this.performSync(), 10000);
      } else {
        console.error(`[SYNC_MANAGER] Max retries (${MAX_RETRIES}) reached, giving up`);
        this.retryCount = 0;
      }

      return result;

    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return {
      isRunning: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      lastSyncResult: this.lastSyncResult,
      nextSyncTime: this.lastSyncTime
        ? new Date(this.lastSyncTime.getTime() + SYNC_INTERVAL_MS)
        : null
    };
  }

  /**
   * Manually trigger a sync (for admin API)
   */
  async triggerManualSync(): Promise<SyncResult> {
    console.log('[SYNC_MANAGER] Manual sync triggered');
    return await this.performSync();
  }
}

// Singleton instance
export const syncManager = new SyncManager();

// Track initialization state
let isInitialized = false;

/**
 * Ensures sync manager is started (lazy initialization)
 * Safe to call multiple times - will only start once
 */
export function ensureSyncManagerStarted(): void {
  if (isInitialized || typeof window !== 'undefined' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    return;
  }

  console.log('[SYNC_MANAGER] Lazy initialization triggered');
  syncManager.startAutoSync();
  isInitialized = true;
}

// Export convenience functions
export const getSyncStatus = (): SyncStatus => syncManager.getStatus();
export const triggerManualSync = (): Promise<SyncResult> => syncManager.triggerManualSync();
