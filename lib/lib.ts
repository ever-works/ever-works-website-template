import 'server-only';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';

export function getContentPath() {
    const contentDir = '.content';

    // During build phase on Vercel, use source directory directly
    // At runtime, use /tmp because build artifact is read-only
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

    if (process.env.VERCEL && !isBuildPhase) {
        return path.join(os.tmpdir(), contentDir);
    }

    return path.join(process.cwd(), contentDir);
}

// Singleton state to ensure content is only copied once
let contentInitialized = false;
let contentInitPromise: Promise<string> | null = null;

/**
 * Ensures content is available at runtime, especially on Vercel
 * - On Vercel: Copies .content from build to /tmp/.content on first access
 * - Locally: Returns .content path directly
 * - Uses singleton pattern to prevent multiple copies
 * - Falls back to .content if copy fails
 * @returns Promise<string> - The actual content path to use
 */
export async function ensureContentAvailable(): Promise<string> {
    // If already initialized, return immediately
    if (contentInitialized) {
        return getContentPath();
    }

    // If initialization is in progress, wait for it
    if (contentInitPromise) {
        return contentInitPromise;
    }

    // Start initialization
    contentInitPromise = (async () => {
        try {
            // Only need special handling on Vercel
            if (!process.env.VERCEL) {
                contentInitialized = true;
                return getContentPath();
            }

            const sourceDir = path.join(process.cwd(), '.content');
            const targetDir = path.join(os.tmpdir(), '.content');

            // Check if target already exists (from previous invocation)
            try {
                await fs.access(targetDir);
                contentInitialized = true;
                return targetDir;
            } catch {
                // Target doesn't exist, need to copy
            }

            // Check if source exists (from build)
            try {
                await fs.access(sourceDir);
            } catch {
                console.warn('[CONTENT] Source .content directory not found, skipping copy');
                contentInitialized = true;
                return targetDir; // Will be created by repository sync
            }

            // Copy .content to /tmp/.content
            console.log('[CONTENT] Copying content from build to runtime location...');
            await copyDirectory(sourceDir, targetDir);
            console.log('[CONTENT] Content copied successfully');

            contentInitialized = true;
            return targetDir;

        } catch (error) {
            console.error('[CONTENT] Failed to copy content, falling back to source:', error);
            contentInitialized = true;
            // Fallback: use source directory from build
            return path.join(process.cwd(), '.content');
        }
    })();

    return contentInitPromise;
}

/**
 * Recursively copy directory contents
 * @param source - Source directory path
 * @param target - Target directory path
 */
async function copyDirectory(source: string, target: string): Promise<void> {
    await fs.mkdir(target, { recursive: true });

    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const targetPath = path.join(target, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(sourcePath, targetPath);
        } else {
            await fs.copyFile(sourcePath, targetPath);
        }
    }
}

export async function fsExists(filepath: string): Promise<boolean> {
    try {
        await fs.access(filepath);
        return true;
    } catch {
        return false;
    }
}

export async function dirExists(dirpath: string) {
    try {
        const stat = await fs.stat(dirpath);
        return stat.isDirectory();
    } catch (err) {
        if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
            return false;
        }
        throw err;
    }
}
