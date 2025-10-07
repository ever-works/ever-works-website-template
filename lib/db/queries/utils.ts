import { eq } from 'drizzle-orm';
import { db } from '../drizzle';
import { clientProfiles } from '../schema';

/**
 * Safely extract username from email address
 * Handles edge cases like empty strings, malformed emails, etc.
 */
export function extractUsernameFromEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return null;
  }

  const username = parts[0].trim();
  if (!username || username.length === 0) {
    return null;
  }

  // Remove any invalid characters, limit length, and normalize to lowercase
  const cleanUsername = username
    .toLowerCase() // Normalize to lowercase for consistency
    .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric, dots, underscores, hyphens
    .substring(0, 30); // Limit length to 30 characters

  return cleanUsername.length > 0 ? cleanUsername : null;
}

/**
 * Ensure a username is unique by appending a numeric suffix if needed
 * @param baseUsername - The base username to check
 * @returns A unique username
 */
export async function ensureUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;
  let counter = 1;

  // Check if username exists, append number if it does
  while (true) {
    const existingProfile = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.username, username))
      .limit(1);

    if (existingProfile.length === 0) {
      return username; // Username is unique
    }

    // Username exists, try with a number suffix
    username = `${baseUsername}${counter}`;
    counter++;

    // Safety check to prevent infinite loops (max 1000 attempts)
    if (counter > 1000) {
      throw new Error(`Unable to generate unique username for: ${baseUsername}`);
    }
  }
}
