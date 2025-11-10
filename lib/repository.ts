import git, { GitAuth, Errors } from "isomorphic-git";
import * as http from "isomorphic-git/http/node";
import * as path from "node:path";
import * as fs from "node:fs";
import { fsExists, getContentPath } from "./lib";

function getGitAuth(token?: string): GitAuth {
  if (!token) {
    return {};
  }
  return { username: "x-access-token", password: token };
}

/**
 * Wraps a promise with a timeout to prevent indefinite hangs
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 2 minutes)
 * @returns Promise that rejects if timeout is reached
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 120000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

let lastSynced: number;
const syncInterval = 10 * 1000;

/* 
    Improve build time and development experience (in dev mode Next.js serves ISR pages dynamically).
*/
function shouldSync() {
  if (!lastSynced) return true;

  if (Date.now() - lastSynced >= syncInterval) return true;

  return false;
}

export async function pullChanges(url: string, dest: string, auth: GitAuth) {
  try {
    const author = { name: "website" }; // required for git pull for some reason
    await withTimeout(
      git.pull({
        onAuth: () => auth,
        fs,
        http,
        url,
        dir: dest,
        author,
        singleBranch: true,
      })
    );
  } catch (err) {
    if (
      err instanceof Errors.MergeConflictError ||
      err instanceof Errors.MergeNotSupportedError
    ) {
      console.error("Merge conflict detected, resetting repository...");
      await fs.promises.rm(dest, { recursive: true });
      await fs.promises.mkdir(dest, { recursive: true });
      await withTimeout(
        git.clone({
          onAuth: () => auth,
          fs,
          http,
          url,
          dir: dest,
          singleBranch: true,
        })
      );
    } else if (err instanceof Error && err.message.includes("Could not find master")) {
      console.error("Repository branch issue detected, trying to clone fresh...");
      await fs.promises.rm(dest, { recursive: true });
      await fs.promises.mkdir(dest, { recursive: true });
      await withTimeout(
        git.clone({
          onAuth: () => auth,
          fs,
          http,
          url,
          dir: dest,
          singleBranch: true,
        })
      );
    } else {
      throw err;
    }
  }
}

export async function trySyncRepository() {
  const token = process.env.GH_TOKEN;
  const url = process.env.DATA_REPOSITORY;
  const DEFAULT_CONFIG = `site_name: Website
item_name: Item
items_name: Items
copyright_year: ${new Date().getFullYear()}
`;

  // Skip repository sync during build if no DATA_REPOSITORY is configured
  if (!url) {
    console.warn(
      "'DATA_REPOSITORY' is not defined. Content features will be limited."
    );
    // Create an empty content directory to avoid errors
    const dest = getContentPath();
    await fs.promises.mkdir(dest, { recursive: true });

    // Create a minimal config.yml file if it doesn't exist
    const configPath = path.join(dest, "config.yml");
    if (!(await fsExists(configPath))) {
      await fs.promises.writeFile(configPath, DEFAULT_CONFIG);
    }

    return;
  }

  // Note: Repository sync will happen during build to ensure content is available
  // Error handling is in place to gracefully handle any sync issues

  const dest = getContentPath();
  const auth = getGitAuth(token);

  const exists = await fsExists(path.join(dest, ".git"));
  try {
    if (exists && !shouldSync()) {
      return;
    }
    if (exists) {
      console.log("Pulling repository data...");
      lastSynced = Date.now();
      await pullChanges(url, dest, auth);
      return;
    }
  } catch (error) {
    console.error("Error during repository sync check:", error);
    // Continue with cloning as fallback
  }

  try {
    console.log("Clonning repository...");
    await fs.promises.mkdir(dest, { recursive: true });
    await withTimeout(
      git.clone({
        onAuth: () => auth,
        fs,
        http,
        url,
        dir: dest,
        singleBranch: true,
      })
    );
  } catch (error) {
    console.error("Failed to clone repository:", error);
    console.warn("Continuing with local content only...");

    // Ensure content directory exists with minimal config
    await fs.promises.mkdir(dest, { recursive: true });
    const configPath = path.join(dest, "config.yml");
    if (!(await fsExists(configPath))) {
      await fs.promises.writeFile(configPath, DEFAULT_CONFIG);
    }
  }

  return;
}
