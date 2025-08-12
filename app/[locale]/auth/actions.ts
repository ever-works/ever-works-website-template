"use server";

import { z } from "zod";
import { ActivityType, NewUser } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import {
  comparePasswords,
  hashPassword,
  AuthProviders,
} from "@/lib/auth/credentials";
import {
  deletePasswordResetToken,
  deleteVerificationToken,
  getPasswordResetTokenByToken,
  getUserByEmail,
  getVerificationTokenByToken,
  insertNewUser,
  logActivity,
  softDeleteUser,
  updateUser,
  updateUserPassword,
  updateUserVerification,
  createClientProfile,
} from "@/lib/db/queries";
import { signIn } from "@/lib/auth";
import {
  generatePasswordResetToken,
  generateVerificationToken,
} from "@/lib/db/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { authServiceFactory } from "@/lib/auth/services";

const PASSWORD_MIN_LENGTH = 8;
const authProviderTypes = ['supabase', 'next-auth', 'both'] as const;

// ReCAPTCHA verification is now handled client-side with React Query
// See /api/verify-recaptcha route and useRecaptchaVerification hook

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(100),
  authProvider: z.enum(authProviderTypes).default('next-auth'),
  captchaToken: z.string().optional(),
});

export const signInAction = validatedAction(signInSchema, async (data) => {
  try {
    const authService = authServiceFactory(data.authProvider);
    const { error } = await authService.signIn(data.email, data.password);
    if (error) {
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      error:
        "Invalid email or password. Please check your credentials and try again.",
      ...data,
    };
  }
});

const signInWithProviderSchema = z.object({
  authProvider: z.enum(authProviderTypes).default('next-auth'),
  redirect: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? val === 'true' : val
  ).default(true),
  callbackUrl: z.string().default('/dashboard'),
  provider: z.enum([
    AuthProviders.GOOGLE,
    AuthProviders.FACEBOOK,
    AuthProviders.GITHUB,
    AuthProviders.TWITTER,
  ]),
})

export const signInWithProvider = validatedAction(
 signInWithProviderSchema,
  async (data) => {
    try {
      const authService = authServiceFactory(data.authProvider);
      
      const result = await authService.signInWithOAuth(data.provider, {
        ...data,
        callbackUrl: data.callbackUrl
      });
      if (result.url) {
        return { 
          success: true,
          url: result.url
        };
      }
      
      return { 
        success: true
      };
    } catch (error) {
      console.error(error);
      return {
        error: "Authentication failed. Please try again.",
        ...data,
      };
    }
  }
);

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  authProvider: z.enum(authProviderTypes).default('next-auth'),
  captchaToken: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  try {
    // ReCAPTCHA is already verified on client-side with React Query
    // No need to re-verify here

    const { name, email, password } = data;
    const authService = authServiceFactory(data.authProvider);
    if (data.authProvider === 'supabase') {
      const { error } = await authService.signUp(email, password);
      if (error) {
        throw error;
      }
    }

  const existingUser = await getUserByEmail(email).catch(() => null);

  if (existingUser) {
    return {
      error: "Failed to create user. Please try again.",
      ...data,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    name,
    email,
    passwordHash,
  };

  const [createdUser] = await insertNewUser(newUser);

  if (!createdUser) {
    return {
      error: "Failed to create user. Please try again.",
      ...data,
    };
  }

  logActivity(createdUser.id, ActivityType.SIGN_UP);

  // Create client profile for new user (only for non-admin users)
  if (!createdUser.isAdmin) {
    try {
      await createClientProfile({
        userId: createdUser.id,
        displayName: createdUser.name,
        username: createdUser.username || createdUser.email?.split('@')[0] || 'user',
        bio: "Welcome! I'm a new user on this platform.",
        jobTitle: "User",
        company: "Unknown",
        status: "active",
        plan: "free",
        accountType: "individual",
      });
      console.log(`Client profile created for user: ${createdUser.email}`);
    } catch (profileError) {
      console.error("Failed to create client profile:", profileError);
      // Don't fail the signup if profile creation fails
      // The user can still use the system and create profile later
    }
  }

  const verificationToken = await generateVerificationToken(email);
  if (verificationToken) {
    sendVerificationEmail(email, verificationToken.token);
  }

  await signIn(AuthProviders.CREDENTIALS, {
    email,
    password,
    redirect: false,
  });

  return { success: true };
  } catch (error) {
    console.error('SignUp error:', error);
    return {
      error: "Failed to create user. Please try again.",
      ...data,
    };
  }
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(PASSWORD_MIN_LENGTH).max(100),
    newPassword: z.string().min(PASSWORD_MIN_LENGTH).max(100),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH).max(100),
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
  password: z.string().min(PASSWORD_MIN_LENGTH).max(100),
  provider: z.enum(authProviderTypes).default('next-auth'),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password, provider } = data;
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
    const authService = authServiceFactory(provider);
    const { error } = await authService.signOut();
    
    if (error) {
      return { error: `Failed to sign out: ${error}` };
    }

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

export const signOutAction = async (provider?: string) => {
  const authService = authServiceFactory(provider||'next-auth');
  const { error } = await authService.signOut();
  if (error) return { error };
  return { success: true };
};

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPassword = validatedAction(
  forgotPasswordSchema,
  async ({ email }) => {
    const dbUser = await getUserByEmail(email).catch(() => null);
    if (!dbUser) {
      return { success: true, email };
    }

    const passwordResetToken = await generatePasswordResetToken(email);

    if (passwordResetToken) {
      sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token
      );
    }

    return { success: true, email };
  }
);

export const verifyEmailAction = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = existingToken.expires < new Date();
  if (hasExpired) {
    return { error: "The token has expired." };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "No account is associated with this token!" };
  }

  await Promise.all([
    updateUserVerification(existingToken.email, true),
    deleteVerificationToken(existingToken.token),
  ]);

  logActivity(existingUser.id, ActivityType.VERIFY_EMAIL);

  return { success: true };
};

export const verifyPasswordTokenAction = async (token: string) => {
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = existingToken.expires < new Date();
  if (hasExpired) {
    return { error: "The token has expired." };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "No account is associated with this token!" };
  }

  return { success: true, userId: existingUser.id };
};

const newPasswordSchema = z
  .object({
    token: z.string(),
    newPassword: z.string().min(PASSWORD_MIN_LENGTH).max(100),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const newPasswordAction = validatedAction(
  newPasswordSchema,
  async (data) => {
    const result = await verifyPasswordTokenAction(data.token);
    if (!result.success) {
      return result;
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await Promise.all([
      updateUserPassword(hashedPassword, result.userId),
      deletePasswordResetToken(data.token),
    ]);

    logActivity(result.userId, ActivityType.UPDATE_PASSWORD);

    return { success: true };
  }
);
