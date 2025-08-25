/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { accounts, sessions, users, verificationTokens } from '../db/schema';
import { db } from '../db/drizzle';
import authConfig from '../../auth.config';
export * from '../payment/config/payment-provider-manager';

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
const drizzle = isDatabaseAvailable
	? DrizzleAdapter(db, {
			usersTable: users as any,
			accountsTable: accounts as any,
			sessionsTable: sessions as any,
			verificationTokensTable: verificationTokens as any
		})
	: undefined;

/**
 * Stripe Provider Singleton
 * Ensures single instance across the application
 */

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
      const isCredentials = account?.provider === 'credentials';
      try {
        if (!user?.email) {
          console.warn('Sign-in attempt without email', { provider: account?.provider });
          return !isCredentials;
        }

        // If DATABASE_URL is not set, we can't validate against the database
        if (!isDatabaseAvailable) {
          console.warn('DATABASE_URL is not set, skipping database validation');
          return !isCredentials;
        }

        return true;
      } catch (error) {
        console.error(
          'Error during sign-in validation',
          error instanceof Error
            ? { name: error.name, message: error.message }
            : { message: 'Unknown error' }
        );
        // Fail closed on validation errors
        return false;
      }
    },
    jwt: async ({ token, user, account }) => {

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

      if (user) {
        if (typeof extendedUser?.isClient === "boolean") {
          token.isAdmin = !extendedUser.isClient;
        } else if (typeof extendedUser?.isAdmin === "boolean") {
          token.isAdmin = extendedUser.isAdmin;
        } else if (typeof token.isAdmin !== "boolean") {
          // First time without explicit flags: default to non-admin
          token.isAdmin = false;
        }
      }

      // Debug (dev only): trace non-PII auth token composition
      if (process.env.NODE_ENV === 'development') {
        try {
          console.debug('[auth][jwt] token composed', {
            provider: token.provider,
            isAdmin: token.isAdmin,
            hasUser: !!user,
            accountProvider: account?.provider,
          });
        } catch {}
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
      // Debug (dev only): trace session payload without PII
      if (process.env.NODE_ENV === 'development') {
        try {
          console.debug('[auth][session] session built', {
            isAdmin: (session.user as any)?.isAdmin,
            provider: (session.user as any)?.provider,
          });
        } catch {}
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
