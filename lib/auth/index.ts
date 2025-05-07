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
    signIn: async ({ account }) => {
      // Allow all OAuth sign-ins
      if (account?.provider !== "credentials") {
        return true;
      }
      return false;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        if (token.userId) {
          session.user.id = token.userId;
        }
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
