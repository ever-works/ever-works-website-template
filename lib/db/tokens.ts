import crypto from "crypto";
import { db } from "./drizzle";
import {
  getPasswordResetTokenByEmail,
  getVerificationTokenByEmail,
} from "./queries";
import { passwordResetTokens, verificationTokens } from "./schema";
import { eq } from "drizzle-orm";

export const generateVerificationToken = async (email: string) => {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, existingToken.identifier));
  }

  return db
    .insert(verificationTokens)
    .values({
      identifier: token,
      email,
      token,
      expires,
    })
    .returning();
};

export const generatePasswordResetToken = async (email: string) => {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, existingToken.id));
  }

  return db
    .insert(passwordResetTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();
};
