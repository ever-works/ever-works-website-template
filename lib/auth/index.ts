/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { db } from "../db/drizzle";
import authConfig from "../../auth.config";

// Check if DATABASE_URL is set
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create the Drizzle adapter if DATABASE_URL is available
const drizzle = isDatabaseAvailable ? DrizzleAdapter(db, {
  usersTable: users as any,
  accountsTable: accounts as any,
  sessionsTable: sessions as any,
  verificationTokensTable: verificationTokens as any,
}) : undefined;

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
      if (user?.id && typeof user.id === "string") {
        token.userId = user.id;
      }
      if (!token.userId && typeof token.sub === "string") {
        token.userId = token.sub;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      if (typeof (user as any)?.isAdmin === "boolean") {
        token.isAdmin = (user as any).isAdmin;
      } else if (typeof (user as any)?.isClient === "boolean") {
        token.isAdmin = !(user as any).isClient;
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
