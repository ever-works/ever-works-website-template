import { NextResponse } from "next/server";
import { trySyncRepository } from "@/lib/repository";

// Types
interface SyncResponse {
  success: true;
  timestamp: string;
  duration: number;
  message: string;
  details?: string;
}

interface SyncError {
  success: false;
  error: string;
  timestamp: string;
  duration: number;
  details?: string;
}

type SyncResult = { success: boolean; message: string; details?: string };

// Background sync status tracking
let lastSyncTime: Date | null = null;
let syncInProgress = false;
let syncPromise: Promise<SyncResult> | null = null;

// Helper function to create sync response
function createSyncResponse(
  success: boolean,
  message: string,
  duration: number,
  details?: string
): NextResponse {
  const response: SyncResponse | SyncError = success
    ? {
        success: true,
        timestamp: new Date().toISOString(),
        duration,
        message,
        ...(details && { details }),
      }
    : {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        duration,
        ...(details && { details }),
      };

  return NextResponse.json(response, {
    status: success ? 200 : 500,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}

// Background sync function
async function performBackgroundSync(): Promise<SyncResult> {
  const startTime = Date.now();
  
  try {
    console.log("[SYNC_API] Starting background repository sync");
    
    // Perform the actual sync
    await trySyncRepository();
    
    // Update sync status
    lastSyncTime = new Date();
    const duration = Date.now() - startTime;
    
    console.log(`[SYNC_API] Background sync completed successfully in ${duration}ms`);
    
    return {
      success: true,
      message: "Repository synchronized successfully",
      details: `Sync completed in ${duration}ms`,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown sync error";
    
    console.error(`[SYNC_API] Background sync failed after ${duration}ms:`, error);
    
    return {
      success: false,
      message: "Repository synchronization failed",
      details: `Sync failed after ${duration}ms: ${errorMessage}`,
    };
  }
}

// POST endpoint for manual sync trigger
export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // Check if sync is already in progress
    if (syncInProgress) {
      console.log("[SYNC_API] Sync already in progress, waiting for completion");
      
      // Wait for existing sync to complete
      if (syncPromise) {
        await syncPromise;
      }
      
      const duration = Date.now() - startTime;
      return createSyncResponse(
        true,
        "Sync was already in progress and has completed",
        duration,
        `Last sync: ${lastSyncTime?.toISOString() || "never"}`
      );
    }

    // Parse request body for options
    let options = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch {
      // Body is optional, ignore parsing errors
    }

    console.log("[SYNC_API] Manual sync triggered", options);

    // Mark sync as in progress
    syncInProgress = true;
    
    // Start sync and store promise
    syncPromise = performBackgroundSync().finally(() => {
      syncInProgress = false;
      syncPromise = null;
    });

    const result = await syncPromise;
    const duration = Date.now() - startTime;

    return createSyncResponse(
      result.success,
      result.message,
      duration,
      result.details
    );

  } catch (error) {
    syncInProgress = false;
    syncPromise = null;
    
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error(`[SYNC_API] Manual sync request failed after ${duration}ms:`, error);
    
    return createSyncResponse(
      false,
      "Manual sync request failed",
      duration,
      errorMessage
    );
  }
}

// GET endpoint for sync status
export async function GET() {
  const now = new Date();
  const timeSinceLastSync = lastSyncTime ? now.getTime() - lastSyncTime.getTime() : null;
  
  const status = {
    syncInProgress,
    lastSyncTime: lastSyncTime?.toISOString() || null,
    timeSinceLastSync,
    timeSinceLastSyncHuman: timeSinceLastSync 
      ? `${Math.floor(timeSinceLastSync / 1000)}s ago`
      : "never",
    uptime: process.uptime(),
    timestamp: now.toISOString(),
  };

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}

// Helper function to start automatic background sync
export async function startBackgroundSync(): Promise<SyncResult | null> {
  if (syncInProgress) {
    console.log("[SYNC_API] Background sync already in progress");
    return null;
  }

  console.log("[SYNC_API] Starting automatic background sync");
  
  syncInProgress = true;
  syncPromise = performBackgroundSync().finally(() => {
    syncInProgress = false;
    syncPromise = null;
  });

  return await syncPromise;
}

// Export sync status for other modules
export function getSyncStatus() {
  return {
    syncInProgress,
    lastSyncTime,
    timeSinceLastSync: lastSyncTime ? Date.now() - lastSyncTime.getTime() : null,
  };
} 