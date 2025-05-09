/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { db } from "../db/drizzle";
import authConfig from "../../auth.config";
import { getUserByEmail } from "../db/queries";

const drizzle = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: drizzle,
  callbacks: {
    authorized: ({ auth }) => auth?.user != null,
    signIn: async ({ user, account }) => {
      try {
        if (!user?.email) {
          console.warn("Sign-in attempt without email", { provider: account?.provider });
          return account?.provider !== "credentials";
        }
        const foundUser = await getUserByEmail(user.email);
        if (foundUser) {
          return true;
        }
        if (account?.provider !== "credentials") {
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error during sign-in validation:", error);
        if (error instanceof Error && error.message === "User not found") {
          return account?.provider !== "credentials";
        }
        return false;
      }
    },
    jwt: async ({ token, user, account }) => {
      if (user?.id) {
        token.userId = user.id;
      }
      if (!token.userId && token.sub) {
        token.userId = token.sub;
      }
      token.provider = account?.provider || "credentials";
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        if (token.userId) {
          session.user.id = token.userId;
        }
        session.user.provider = token.provider || "credentials";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/register",
  },
  ...authConfig,
});
