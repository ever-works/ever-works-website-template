import { DefaultSession, DefaultUser } from "next-auth";

// Extend NextAuth session and user types to include isAdmin

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      provider?: string;
      isAdmin?: boolean;
      customerId?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    isAdmin?: boolean;
    customerId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: string;
    isAdmin?: boolean;
    customerId?: string;
  }
}