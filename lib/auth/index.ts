/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { db } from "../db/drizzle";
import authConfig from "../../auth.config";
import { getUserByEmail, createClientProfile } from "../db/queries";

// Check if DATABASE_URL is set
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create the Drizzle adapter if DATABASE_URL is available
const drizzle = isDatabaseAvailable ? DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
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
      // If the URL is relative, make it absolute
      if (url.startsWith('/')) {
        url = `${baseUrl}${url}`;
      }
      
      // If the URL is on the same origin, check if we need to redirect based on user type
      if (url.startsWith(baseUrl)) {
        // For now, let NextAuth handle the default redirect
        // We'll handle specific redirects in the signup/signin actions
        return url;
      }
      
      return baseUrl;
    },
    signIn: async ({ user, account, profile }) => {
      try {
        if (!user?.email) {
          console.warn("Sign-in attempt without email", { provider: account?.provider });
          return account?.provider !== "credentials";
        }
        
        // First try to get user from users table (admin users)
        const foundUser = await getUserByEmail(user.email);
        
        // If user found in users table, allow sign in
        if (foundUser) {
          return true;
        }
        
        // If no user found, check if it's a client user
        const { getClientAccountByEmail, getClientProfileByEmail } = await import("../db/queries");
        const clientAccount = await getClientAccountByEmail(user.email);
        const clientProfile = await getClientProfileByEmail(user.email);
        
        if (clientAccount && clientProfile) {
          // Client user found, allow sign in
          return true;
        }
        
        // If getUserByEmail returns null, it means the database is not available
        if (foundUser === null) {
          console.warn("Database validation failed, user might not exist");
          // Allow OAuth sign-ins but not credentials when validation fails
          return account?.provider !== "credentials";
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
      // Check if this is a client user (has account record but no user record)
      let dbUser = null;
      let isClientUser = false;
      
      if (user?.email) {
        // First try to get user from users table (admin users)
        dbUser = await getUserByEmail(user.email);
        
        // If no user found, check if it's a client user
        if (!dbUser) {
          const { getClientAccountByEmail, getClientProfileByEmail } = await import("../db/queries");
          const clientAccount = await getClientAccountByEmail(user.email);
          const clientProfile = await getClientProfileByEmail(user.email);
          
          if (clientAccount && clientProfile) {
            isClientUser = true;
            // For client users, use the client profile as the user data
            dbUser = {
              id: clientProfile.id,
              name: clientProfile.name || clientProfile.displayName,
              email: clientProfile.email,
              isClient: true,
            };
          }
        }
      } else if (token?.email) {
        // Same logic for token.email
        dbUser = await getUserByEmail(token.email);
        
        if (!dbUser) {
          const { getClientAccountByEmail, getClientProfileByEmail } = await import("../db/queries");
          const clientAccount = await getClientAccountByEmail(token.email);
          const clientProfile = await getClientProfileByEmail(token.email);
          
          if (clientAccount && clientProfile) {
            isClientUser = true;
            dbUser = {
              id: clientProfile.id,
              name: clientProfile.name || clientProfile.displayName,
              email: clientProfile.email,
              isClient: true,
            };
          }
        }
      }
      
      if (user?.id && typeof user.id === "string") {
        token.userId = user.id;
      }
      if (!token.userId && typeof token.sub === "string") {
        token.userId = token.sub;
      }
      token.provider = account?.provider || "credentials";
      
      // Add isAdmin to token if available from dbUser
      if (dbUser) {
        if (isClientUser) {
          // Client users are not admin
          token.isAdmin = false;
        } else {
          // All users in users table are considered admin
          token.isAdmin = true;
          
          // Create client profile for OAuth users if they don't have one
          if (account?.provider !== "credentials" && dbUser.id) {
            try {
              const { getClientProfileByEmail, createClientProfile, createClientAccount } = await import("../db/queries");
              const existingProfile = await getClientProfileByEmail(dbUser.email);
              
              if (!existingProfile) {
                // Create client profile
                await createClientProfile({
                  email: dbUser.email,
                  name: dbUser.name,
                  displayName: dbUser.name,
                  username: dbUser.username || dbUser.email?.split('@')[0] || 'user',
                  bio: "Welcome! I'm a new user on this platform.",
                  jobTitle: "User",
                  company: "Unknown",
                  status: "active",
                  plan: "free",
                  accountType: "individual",
                });
                console.log(`Client profile created for OAuth user: ${dbUser.email}`);
              }

              // Create account record for OAuth users (without password since they use OAuth)
              if (dbUser.email) {
                await createClientAccount(dbUser.id, dbUser.email, null);
                console.log(`Account record created for OAuth user: ${dbUser.email}`);
              }
            } catch (profileError) {
              console.error("Failed to create client profile/account for OAuth user:", profileError);
              // Don't fail the auth if profile creation fails
            }
          }
        }
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
