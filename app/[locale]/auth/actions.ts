"use server";

import { z } from "zod";
import { ActivityType, NewUser } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import { comparePasswords, hashPassword } from "@/lib/auth/credentials";
import {
  getUserByEmail,
  insertNewUser,
  logActivity,
  softDeleteUser,
  updateUser,
  updateUserPassword,
} from "@/lib/db/queries";
import { signOut } from "@/lib/auth";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;

  const existingUser = await getUserByEmail(email).catch(() => null);

  if (existingUser) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
  };

  const [createdUser] = await insertNewUser(newUser);

  if (!createdUser) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  logActivity(createdUser.id, ActivityType.SIGN_UP);

  // redirect("/dashboard");
  return { success: "User created successfully" };
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const dbUser = await getUserByEmail(user.email!).catch(() => null);
    if (!dbUser) {
      return { error: "User not found" };
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      dbUser.passwordHash
    );

    if (!isPasswordValid) {
      return { error: "Current password is incorrect." };
    }

    if (currentPassword === newPassword) {
      return {
        error: "New password must be different from the current password.",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      updateUserPassword(newPasswordHash, dbUser.id),

      logActivity(dbUser.id, ActivityType.UPDATE_PASSWORD),
    ]);

    return { success: "Password updated successfully." };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const dbUser = await getUserByEmail(user.email!).catch(() => null);
    if (!dbUser) {
      return { error: "User not found" };
    }

    const isPasswordValid = await comparePasswords(
      password,
      dbUser.passwordHash
    );
    if (!isPasswordValid) {
      return { error: "Incorrect password. Account deletion failed." };
    }

    await logActivity(dbUser.id, ActivityType.DELETE_ACCOUNT);

    await softDeleteUser(dbUser.id);

    await signOut();

    redirect("/auth/signin");
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    const dbUser = await getUserByEmail(user.email!).catch(() => null);
    if (!dbUser) {
      return { error: "User not found" };
    }

    await Promise.all([
      updateUser({ name, email }, dbUser.id),
      logActivity(dbUser.id, ActivityType.UPDATE_ACCOUNT),
    ]);

    return { success: "Account updated successfully." };
  }
);
