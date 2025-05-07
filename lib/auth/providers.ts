import { credentialsProvider } from "./credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import MicrosoftProvider from "next-auth/providers/azure-ad";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var ${key}`);
  }
  return value;
}

export const providers = [
  credentialsProvider,
  GoogleProvider({
    clientId: getEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: { access_type: "offline", prompt: "consent" },
    },
  }),
  GitHubProvider({
    clientId: getEnv("GITHUB_CLIENT_ID"),
    clientSecret: getEnv("GITHUB_CLIENT_SECRET"),
  }),
  FacebookProvider({
    clientId: getEnv("FB_CLIENT_ID"),
    clientSecret: getEnv("FB_CLIENT_SECRET"),
  }),
  TwitterProvider({
    clientId: getEnv("X_CLIENT_ID"),
    clientSecret: getEnv("X_CLIENT_SECRET"),
  }),
  MicrosoftProvider({
    clientId: getEnv("MICROSOFT_CLIENT_ID"),
    clientSecret: getEnv("MICROSOFT_CLIENT_SECRET"),
  }),
];
