import { eq } from 'drizzle-orm';
import { db } from '../drizzle';
import { passwordResetTokens, verificationTokens } from '../schema';

// ===================== Password Reset Token Queries =====================

/**
 * Get password reset token by email
 * @param email - User email
 * @returns Password reset token or undefined
 */
export async function getPasswordResetTokenByEmail(email: string) {
  const tokens = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.email, email))
    .limit(1);

  return tokens[0];
}

/**
 * Get password reset token by token string
 * @param token - Reset token string
 * @returns Password reset token or undefined
 */
export async function getPasswordResetTokenByToken(token: string) {
  const tokens = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  return tokens.at(0);
}

/**
 * Delete password reset token
 * @param token - Reset token string to delete
 */
export async function deletePasswordResetToken(token: string) {
  return db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
}

// ===================== Verification Token Queries =====================

/**
 * Get verification token by email
 * @param email - User email
 * @returns Verification token or undefined
 */
export async function getVerificationTokenByEmail(email: string) {
  const tokens = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.email, email))
    .limit(1);

  return tokens[0];
}

/**
 * Get verification token by token string
 * @param token - Verification token string
 * @returns Verification token or undefined
 */
export async function getVerificationTokenByToken(token: string) {
  const tokens = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  return tokens.at(0);
}

/**
 * Delete verification token
 * @param token - Verification token string to delete
 */
export async function deleteVerificationToken(token: string) {
  return db.delete(verificationTokens).where(eq(verificationTokens.token, token));
}
