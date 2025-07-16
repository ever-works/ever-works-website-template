import { NextResponse } from "next/server";
import { startBackgroundSync, getSyncStatus } from "@/lib/services/sync-service";

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

// POST endpoint for manual sync trigger
export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // Parse request body for options
    let options = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch {
      // Body is optional, ignore parsing errors
    }

    console.log("[SYNC_API] Manual sync triggered", options);

    const result = await startBackgroundSync();
    const duration = Date.now() - startTime;

    if (result === null) {
      return createSyncResponse(
        true,
        "Sync was already in progress",
        duration,
        "Another sync operation is currently running"
      );
    }

    return createSyncResponse(
      result.success,
      result.message,
      duration,
      result.details
    );

  } catch (error) {
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
  const syncStatus = getSyncStatus();
  const now = new Date();
  const timeSinceLastSync = syncStatus.lastSyncTime ? now.getTime() - syncStatus.lastSyncTime.getTime() : null;
  
  const status = {
    syncInProgress: syncStatus.syncInProgress,
    lastSyncTime: syncStatus.lastSyncTime?.toISOString() || null,
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