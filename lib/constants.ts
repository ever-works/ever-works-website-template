import { getNextPublicEnv } from "@/env-config";

export const DEFAULT_LOCALE = "en";

export const LOCALES: Readonly<string[]> = ["en", "fr", "es"];

export const LOGO_URL = "/logo-ever-work-3.png";
export const POST_HOG_KEY = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_KEY");
export const POST_HOG_HOST = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_HOST");
