import { NextResponse } from "next/server";
import { triggerManualSync } from "@/lib/services/sync-service";

/**
 * Vercel Cron endpoint for automatic content synchronization.
 * Triggered every minute by Vercel's cron system.
 *
 * This endpoint calls the same triggerManualSync() function used by
 * the manual sync endpoint, ensuring consistent behavior and
 * proper cache invalidation after successful sync.
 */

interface CronSyncResponse {
    success: boolean;
    timestamp: string;
    duration: number;
    message: string;
    details?: string;
}

export async function GET(): Promise<NextResponse<CronSyncResponse>> {
    const startTime = Date.now();

    try {
        console.log("[CRON_SYNC] Vercel cron sync triggered");

        const result = await triggerManualSync();
        const duration = Date.now() - startTime;

        const response: CronSyncResponse = {
            success: result.success,
            timestamp: new Date().toISOString(),
            duration,
            message: result.message,
            ...(result.details && { details: result.details }),
        };

        console.log(`[CRON_SYNC] Completed in ${duration}ms: ${result.message}`);

        return NextResponse.json(response, {
            status: result.success ? 200 : 500,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        console.error(`[CRON_SYNC] Failed after ${duration}ms:`, error);

        const response: CronSyncResponse = {
            success: false,
            timestamp: new Date().toISOString(),
            duration,
            message: "Cron sync failed",
            details: errorMessage,
        };

        return NextResponse.json(response, {
            status: 500,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        });
    }
}
