import type { NextAuthConfig } from "next-auth";
import { credentialsProvider } from "./credentials";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [credentialsProvider],
} satisfies NextAuthConfig;
