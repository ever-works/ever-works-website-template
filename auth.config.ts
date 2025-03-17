import type { NextAuthConfig } from "next-auth";
import { credentialsProvider } from "./lib/auth/credentials";

// Notice this is only an object, not a full Auth.js instance
export default {
  trustHost: true,
  providers: [credentialsProvider],
} satisfies NextAuthConfig;
