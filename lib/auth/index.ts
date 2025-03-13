import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "../db/schema.js";
import { db } from "../db/drizzle.js";
import { credentialsProvider } from "./credentials.js";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [credentialsProvider],
  callbacks: {
    authorized: ({ auth }) => auth?.user != null,
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
});
