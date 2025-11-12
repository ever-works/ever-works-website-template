import { trySyncRepository } from "@/lib/repository";

// Types
export type SyncResult = { success: boolean; message: string; details?: string };

// Background sync status tracking
let lastSyncTime: Date | null = null;
let syncInProgress = false;

// Background sync function
async function performBackgroundSync(): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    // Reduce logging in development mode
    if (process.env.NODE_ENV !== 'development') {
      console.log("[SYNC_SERVICE] Starting background repository sync");
    }

    // Perform the actual sync
    await trySyncRepository();

    // Update sync status
    lastSyncTime = new Date();
    const duration = Date.now() - startTime;

    // Reduce logging in development mode
    if (process.env.NODE_ENV !== 'development') {
      console.log(`[SYNC_SERVICE] Background sync completed successfully in ${duration}ms`);
    }
    
    return {
      success: true,
      message: "Repository synchronized successfully",
      details: `Sync completed in ${duration}ms`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown sync error";

    // Always log errors regardless of environment
    console.error(`[SYNC_SERVICE] Background sync failed after ${duration}ms:`, error);
    
    return {
      success: false,
      message: "Repository synchronization failed",
      details: `Sync failed after ${duration}ms: ${errorMessage}`,
    };
  }
}

// Helper function to start automatic background sync
export async function startBackgroundSync(): Promise<SyncResult | null> {
  // Skip background sync in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  if (syncInProgress) {
    // Reduce logging in development mode
    if (process.env.NODE_ENV !== 'development') {
      console.log("[SYNC_SERVICE] Background sync already in progress");
    }
    return null;
  }

  // Reduce logging in development mode
  if (process.env.NODE_ENV !== 'development') {
    console.log("[SYNC_SERVICE] Starting automatic background sync");
  }

  syncInProgress = true;
  try {
    await performBackgroundSync();
  } finally {
    syncInProgress = false;
  }
  return null;
}

// Export sync status for other modules
export function getSyncStatus() {
  return {
    syncInProgress,
    lastSyncTime,
    timeSinceLastSync: lastSyncTime ? Date.now() - lastSyncTime.getTime() : null,
  };
} 