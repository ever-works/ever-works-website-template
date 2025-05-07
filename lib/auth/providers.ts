import { credentialsProvider } from "./credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import MicrosoftProvider from "next-auth/providers/azure-ad";

export const providers = [
  credentialsProvider,
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: { access_type: "offline", prompt: "consent" },
    },
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: { access_type: "offline", prompt: "consent" },
    },
  }),
  FacebookProvider({
    clientId: process.env.FB_CLIENT_ID!,
    clientSecret: process.env.FB_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: { access_type: "offline", prompt: "consent" },
    },
  }),
  TwitterProvider({
    clientId: process.env.X_CLIENT_ID!,
    clientSecret: process.env.X_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: { access_type: "offline", prompt: "consent" },
    },
  }),
  MicrosoftProvider({
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: { access_type: "offline", prompt: "consent" },
    },
  }),
];
