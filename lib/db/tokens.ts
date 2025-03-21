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

  const items = await db
    .insert(verificationTokens)
    .values({
      identifier: token,
      email,
      token,
      expires,
    })
    .returning();

  return items[0];
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

  const items = await db
    .insert(passwordResetTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return items[0];
};
