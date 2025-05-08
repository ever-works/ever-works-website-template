import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { db } from "../db/drizzle";
import authConfig from "../../auth.config";

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
        if (account?.provider !== "credentials") {
          return true;
        }

        if (!user?.email) {
          return false;
        }
        return true;
      } catch (error: any) {
        throw new Error("Failed to check for existing user", error);
      }
    },
    jwt: async ({ token, user, account }) => {
      // Link accounts with the same email
      if (user?.id) {
        token.userId = user.id;
      }
      // Ensure userId is always set
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
