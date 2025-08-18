/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { db } from "../db/drizzle";
import authConfig from "../../auth.config";

import { createProviderConfigs, StripeProvider } from "../payment";

// Define proper interface for user objects with admin/client properties
interface ExtendedUser {
  id?: string;
  email?: string;
  isAdmin?: boolean;
  isClient?: boolean;
}

// Check if DATABASE_URL is set
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create the Drizzle adapter if DATABASE_URL is available
const drizzle = isDatabaseAvailable ? DrizzleAdapter(db, {
  usersTable: users as any,
  accountsTable: accounts as any,
  sessionsTable: sessions as any,
  verificationTokensTable: verificationTokens as any,
}) : undefined;

/**
 * Stripe Provider Singleton
 * Ensures single instance across the application
 */
class StripeProviderSingleton {
  private static instance: StripeProvider | null = null;
  private static isInitializing = false;

  private constructor() {}

  public static getInstance(): StripeProvider {
    if (!StripeProviderSingleton.instance && !StripeProviderSingleton.isInitializing) {
      StripeProviderSingleton.isInitializing = true;
      
      const requiredEnvVars = {
        apiKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      };

      if (!requiredEnvVars.apiKey || !requiredEnvVars.webhookSecret || !requiredEnvVars.publishableKey) {
        throw new Error('Stripe configuration is incomplete');
      }

      const configs = createProviderConfigs({
        apiKey: requiredEnvVars.apiKey,
        webhookSecret: requiredEnvVars.webhookSecret,
        options: {
          publishableKey: requiredEnvVars.publishableKey,
          apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16'
        }
      });

      StripeProviderSingleton.instance = new StripeProvider(configs.stripe);
      StripeProviderSingleton.isInitializing = false;
    }

    if (!StripeProviderSingleton.instance) {
      throw new Error('Failed to initialize Stripe provider');
    }

    return StripeProviderSingleton.instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static reset(): void {
    StripeProviderSingleton.instance = null;
    StripeProviderSingleton.isInitializing = false;
  }

  /**
   * Check if singleton is initialized
   */
  public static isInitialized(): boolean {
    return StripeProviderSingleton.instance !== null;
  }
}

/**
 * Initialize Stripe provider (singleton pattern)
 * @returns StripeProvider instance
 */
export function initializeStripeProvider(): StripeProvider {
  return StripeProviderSingleton.getInstance();
}

/**
 * Get Stripe provider instance without initialization
 * @returns StripeProvider instance or null if not initialized
 */
export function getStripeProvider(): StripeProvider | null {
  return StripeProviderSingleton.isInitialized() ? StripeProviderSingleton.getInstance() : null;
}

/**
 * Reset Stripe provider singleton (useful for testing)
 */
export function resetStripeProvider(): void {
  StripeProviderSingleton.reset();
}

/**
 * Get or create Stripe provider instance (most efficient)
 * @returns StripeProvider instance
 */
export function getOrCreateStripeProvider(): StripeProvider {
  // Try to get existing instance first
  const existingProvider = getStripeProvider();
  if (existingProvider) {
    return existingProvider;
  }
  
  // Create new instance if none exists
  return initializeStripeProvider();
}


export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: drizzle,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized: ({ auth }) => auth?.user != null,
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith('/')) {
        url = `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
    signIn: async ({ user, account }) => {
      try {
        // Avoid any database work here (Edge runtime).
        // If we have an email/user from provider, allow; otherwise, default to provider behavior.
        if (!user?.email) {
          return account?.provider !== "credentials";
        }
        return true;
      } catch {
        return false;
      }
    },
    jwt: async ({ token, user, account }) => {
      // Do not query DB here (Edge runtime). Just carry flags from user if present.
      const extendedUser = user as ExtendedUser;
      
      if (extendedUser?.id && typeof extendedUser.id === "string") {
        token.userId = extendedUser.id;
      }
      if (!token.userId && typeof token.sub === "string") {
        token.userId = token.sub;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      
      // Set admin flag based on user properties
      // Any user in the users table is considered an admin
      // Client users (from client_profiles) are not admins
      if (typeof extendedUser?.isClient === "boolean") {
        token.isAdmin = !extendedUser.isClient;
      } else {
        // If user is not marked as client, they are from users table = admin
        token.isAdmin = true;
      }
      
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        if (typeof token.userId === "string") {
          session.user.id = token.userId;
        }
        session.user.provider = typeof token.provider === "string" ? token.provider : "credentials";
        if (typeof token.isAdmin === "boolean") {
          session.user.isAdmin = token.isAdmin;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/register",
  },
  ...authConfig,
});
