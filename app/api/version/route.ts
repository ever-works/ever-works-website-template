import { NextResponse } from "next/server";
import git from "isomorphic-git";
import * as fs from "fs";
import * as path from "path";
import { getContentPath } from "@/lib/lib";
import { fsExists } from "@/lib/lib";
import { trySyncRepository } from "@/lib/repository";

// Types
export interface VersionInfo {
  commit: string;
  date: string;
  message: string;
  author: string;
  repository: string;
  lastSync: string;
  branch?: string;
}

interface ErrorResponse {
  error: string;
  code: string;
  timestamp: string;
  details?: string;
}

// Git commit type
type GitCommit = Awaited<ReturnType<typeof git.log>>[0];

// Error codes for better error handling
const ERROR_CODES = {
  REPOSITORY_NOT_FOUND: 'REPOSITORY_NOT_FOUND',
  NO_COMMITS: 'NO_COMMITS',
  SYNC_FAILED: 'SYNC_FAILED',
  GIT_ERROR: 'GIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// Custom error class for better error handling
class VersionApiError extends Error {
  constructor(
    message: string,
    public code: keyof typeof ERROR_CODES,
    public statusCode: number,
    public details?: string
  ) {
    super(message);
    this.name = 'VersionApiError';
  }
}

// Helper function to create error responses
function createErrorResponse(error: VersionApiError): NextResponse {
  const errorResponse: ErrorResponse = {
    error: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    details: error.details,
  };

  return NextResponse.json(errorResponse, {
    status: error.statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

// Helper function to validate git directory
async function validateGitDirectory(gitDir: string): Promise<void> {
  if (!await fsExists(gitDir)) {
    throw new VersionApiError(
      "Data repository not found",
      ERROR_CODES.REPOSITORY_NOT_FOUND,
      404,
      `Git directory not found at: ${gitDir}`
    );
  }
}

// Helper function to get commit information
async function getLatestCommit(contentPath: string): Promise<GitCommit> {
  try {
    const commits = await git.log({
      fs,
      dir: contentPath,
      depth: 1,
    });

    if (commits.length === 0) {
      throw new VersionApiError(
        "No commits found in repository",
        ERROR_CODES.NO_COMMITS,
        404,
        "Repository exists but contains no commits"
      );
    }

    return commits[0];
  } catch (error) {
    if (error instanceof VersionApiError) {
      throw error;
    }
    
    throw new VersionApiError(
      "Failed to retrieve commit information",
      ERROR_CODES.GIT_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown git error"
    );
  }
}

// Helper function to get current branch
async function getCurrentBranch(contentPath: string): Promise<string> {
  try {
    const branch = await git.currentBranch({
      fs,
      dir: contentPath,
    });
    return branch || "main";
  } catch (error) {
    console.warn("Could not determine current branch:", error);
    return "main";
  }
}

// Helper function to validate commit data
function validateCommitData(commit: GitCommit): void {
  if (!commit.oid || !commit.commit?.author?.name || !commit.commit?.author?.timestamp) {
    throw new VersionApiError(
      "Invalid commit data",
      ERROR_CODES.VALIDATION_ERROR,
      500,
      "Commit is missing required fields"
    );
  }
}

// Helper function to create version info
function createVersionInfo(
  commit: GitCommit,
  branch: string,
  repository: string | undefined
): VersionInfo {
  validateCommitData(commit);

  return {
    commit: commit.oid.substring(0, 7),
    date: new Date(commit.commit.author.timestamp * 1000).toISOString(),
    message: commit.commit.message.trim(),
    author: commit.commit.author.name,
    repository: repository || "unknown",
    lastSync: new Date().toISOString(),
    branch,
  };
}

// Helper function to create success response headers
function createSuccessHeaders(commit: GitCommit): Record<string, string> {
  return {
    // Cache for 1 minute on the client, but allow revalidation
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    // Add ETag for better caching
    "ETag": `"${commit.oid.substring(0, 7)}-${Date.now()}"`,
    // Add last modified header
    "Last-Modified": new Date(commit.commit.author.timestamp * 1000).toUTCString(),
    // Add content type
    "Content-Type": "application/json",
  };
}

// Main API handler
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Performance: Log API call
    console.log("[VERSION_API] Starting version info request");

    // Step 1: Sync repository with timeout and retry logic
    try {
      await trySyncRepository();
      console.log("[VERSION_API] Repository sync completed successfully");
    } catch (syncError) {
      console.warn("[VERSION_API] Repository sync failed:", syncError);
      // Continue with existing data instead of failing completely
    }

    // Step 2: Validate paths and environment
    const contentPath = getContentPath();
    const gitDir = path.join(contentPath, ".git");
    const repository = process.env.DATA_REPOSITORY;

    if (!repository) {
      console.warn("[VERSION_API] DATA_REPOSITORY environment variable not set");
    }

    // Step 3: Validate git directory
    await validateGitDirectory(gitDir);

    // Step 4: Get latest commit information
    const latestCommit = await getLatestCommit(contentPath);

    // Step 5: Get current branch
    const branch = await getCurrentBranch(contentPath);

    // Step 6: Create version info
    const versionInfo = createVersionInfo(latestCommit, branch, repository);

    // Step 7: Create response headers
    const headers = createSuccessHeaders(latestCommit);

    // Performance: Log completion time
    const duration = Date.now() - startTime;
    console.log(`[VERSION_API] Request completed successfully in ${duration}ms`);

    return NextResponse.json(versionInfo, { headers });

  } catch (error) {
    // Performance: Log error time
    const duration = Date.now() - startTime;
    
    if (error instanceof VersionApiError) {
      console.error(`[VERSION_API] Known error after ${duration}ms:`, {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return createErrorResponse(error);
    }

    // Handle unexpected errors
    console.error(`[VERSION_API] Unexpected error after ${duration}ms:`, error);
    
    const unexpectedError = new VersionApiError(
      "Internal server error",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred"
    );

    return createErrorResponse(unexpectedError);
  }
} 