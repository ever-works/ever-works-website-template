import { NextResponse } from "next/server";
import git from "isomorphic-git";
import * as fs from "fs";
import * as path from "path";
import { getContentPath } from "@/lib/lib";
import { fsExists } from "@/lib/lib";
import { trySyncRepository } from "@/lib/repository";

export interface VersionInfo {
  commit: string;
  date: string;
  message: string;
  author: string;
  repository: string;
  lastSync: string;
}

export async function GET() {
  try {
    // Try to sync repository first to ensure we have the latest data
    await trySyncRepository();
    
    const contentPath = getContentPath();
    const gitDir = path.join(contentPath, ".git");
    
    // Check if git directory exists
    if (!await fsExists(gitDir)) {
      return NextResponse.json(
        { error: "Data repository not found" },
        { 
          status: 404,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          }
        }
      );
    }

    // Get the latest commit information
    const commits = await git.log({
      fs,
      dir: contentPath,
      depth: 1,
    });

    if (commits.length === 0) {
      return NextResponse.json(
        { error: "No commits found" },
        { 
          status: 404,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          }
        }
      );
    }

    const latestCommit = commits[0];
    
    // Get current branch name
    let branch = "main";
    try {
      branch = await git.currentBranch({
        fs,
        dir: contentPath,
      }) || "main";
    } catch (error) {
      console.warn("Could not determine current branch:", error);
    }

    const versionInfo: VersionInfo = {
      commit: latestCommit.oid.substring(0, 7), // Short commit hash
      date: new Date(latestCommit.commit.author.timestamp * 1000).toISOString(),
      message: latestCommit.commit.message,
      author: latestCommit.commit.author.name,
      repository: process.env.DATA_REPOSITORY || "unknown",
      lastSync: new Date().toISOString(),
    };

    return NextResponse.json(versionInfo, {
      headers: {
        // Cache for 1 minute on the client, but allow revalidation
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        // Add ETag for better caching
        "ETag": `"${latestCommit.oid.substring(0, 7)}-${Date.now()}"`,
        // Add last modified header
        "Last-Modified": new Date(latestCommit.commit.author.timestamp * 1000).toUTCString(),
      }
    });
  } catch (error) {
    console.error("Error fetching version info:", error);
    return NextResponse.json(
      { error: "Failed to fetch version information" },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      }
    );
  }
} 