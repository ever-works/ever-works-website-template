import { getNextPublicEnv } from "@/env-config";

export const DEFAULT_LOCALE = "en";

export const LOCALES = ["en", "fr", "es", "zh", "de", "ar"] as const;

export const LOGO_URL = "/logo-ever-work-3.png";
export const POST_HOG_KEY = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_KEY");
export const POST_HOG_HOST = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_HOST");
export const API_BASE_URL = getNextPublicEnv("NEXT_PUBLIC_API_BASE_URL");
export const COOKIE_SECRET = getNextPublicEnv("COOKIE_SECRET");
export const JWT_ACCESS_TOKEN_EXPIRES_IN = getNextPublicEnv("JWT_ACCESS_TOKEN_EXPIRES_IN");
export const JWT_REFRESH_TOKEN_EXPIRES_IN = getNextPublicEnv("JWT_REFRESH_TOKEN_EXPIRES_IN");





export type Locale = (typeof LOCALES)[number];