import { NextAuthConfig } from "next-auth";
import { createNextAuthProviders } from "./lib/auth/providers";

// Notice this is only an object, not a full Auth.js instance
export default {
  trustHost: true,
  providers: createNextAuthProviders({
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    facebook: {
      enabled: true,
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    twitter: {
      enabled: true,
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    },
    credentials: {
      enabled: true,
    },
  }),
} satisfies NextAuthConfig;
