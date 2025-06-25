import { getNextPublicEnv } from "@/env-config";

export const DEFAULT_LOCALE = "en";

<<<<<<< HEAD
export const LOCALES: Readonly<string[]> = ["en", "fr", "es"];

export const LOGO_URL = "/logo-ever-work-3.png";
export const POST_HOG_KEY = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_KEY");
export const POST_HOG_HOST = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_HOST");
=======
export const LOCALES = ["en", "fr", "es", "zh", "de", "ar"] as const;

export type Locale = (typeof LOCALES)[number];
>>>>>>> 86cc209 (feat(i18n): add support for Chinese, German and Arabic languages)
