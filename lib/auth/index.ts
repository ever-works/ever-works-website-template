/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDrizzleInstance } from '../db/drizzle';
import { users, accounts, sessions, verificationTokens } from '../db/schema';
import authConfig from '../../auth.config';
import { invalidateSessionCache } from './cached-session';
export * from '../payment/config/payment-provider-manager';

// Define proper interface for user objects with admin/client properties
interface ExtendedUser {
	id?: string;
	email?: string;
	isAdmin?: boolean;
	isClient?: boolean;
}

// Check if DATABASE_URL is set and database is properly initialized
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create the Drizzle adapter if we have a real database connection
const drizzle = isDatabaseAvailable
	? DrizzleAdapter(getDrizzleInstance(), {
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
    signIn: async ({ user, account, profile }) => {
      const isCredentials = account?.provider === 'credentials';
      console.log('Sign-in attempt', { user, account, profile });

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

        // For OAuth providers, allow account linking to prevent OAuthAccountNotLinked errors
        if (!isCredentials && account?.provider) {
          console.log(`OAuth sign-in with ${account.provider} for email: ${user.email}`);
          return true;
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
  events: {
    signOut: async (event) => {
      // Invalidate cached session on sign-out
      const token = 'token' in event ? event.token : undefined;
      if (token?.userId && typeof token.userId === 'string') {
        try {
          invalidateSessionCache(undefined, token.userId);

          if (process.env.NODE_ENV === 'development') {
            console.log('[SessionCache] Invalidated cache on sign-out for user:', token.userId);
          }
        } catch (error) {
          console.error('[SessionCache] Error invalidating cache on sign-out:', error);
        }
      }
    },
    updateUser: async ({ user }) => {
      // Invalidate cached session when user data is updated
      if (user?.id) {
        try {
          invalidateSessionCache(undefined, user.id);

          if (process.env.NODE_ENV === 'development') {
            console.log('[SessionCache] Invalidated cache on user update for user:', user.id);
          }
        } catch (error) {
          console.error('[SessionCache] Error invalidating cache on user update:', error);
        }
      }
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
