import { getNextPublicEnv } from "@/env-config";

// ============================================
// LOCALIZATION
// ============================================
export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "fr", "es", "zh", "de", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

// ============================================
// BRANDING & UI
// ============================================
export const LOGO_URL = "/logo-ever-work-3.png";

// ============================================
// API & BACKEND
// ============================================
export const API_BASE_URL = getNextPublicEnv("NEXT_PUBLIC_API_BASE_URL");

// ============================================
// AUTHENTICATION & SECURITY
// ============================================
export const COOKIE_SECRET = getNextPublicEnv("COOKIE_SECRET");
export const JWT_ACCESS_TOKEN_EXPIRES_IN = getNextPublicEnv("JWT_ACCESS_TOKEN_EXPIRES_IN");
export const JWT_REFRESH_TOKEN_EXPIRES_IN = getNextPublicEnv("JWT_REFRESH_TOKEN_EXPIRES_IN");

// ============================================
// ANALYTICS - POSTHOG
// ============================================
export const POSTHOG_KEY = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_KEY");
export const POSTHOG_HOST = getNextPublicEnv("NEXT_PUBLIC_POSTHOG_HOST");
export const POSTHOG_ENABLED = POSTHOG_KEY && POSTHOG_HOST;
export const POSTHOG_DEBUG = getNextPublicEnv("POSTHOG_DEBUG");

// PostHog Features
export const POSTHOG_SESSION_RECORDING_ENABLED = getNextPublicEnv("POSTHOG_SESSION_RECORDING_ENABLED", "true");
export const POSTHOG_AUTO_CAPTURE = getNextPublicEnv("POSTHOG_AUTO_CAPTURE", "false");

// PostHog Sampling
export const POSTHOG_SAMPLE_RATE = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
export const POSTHOG_SESSION_RECORDING_SAMPLE_RATE = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;

// ============================================
// ERROR TRACKING - SENTRY
// ============================================
export const SENTRY_DSN = getNextPublicEnv("NEXT_PUBLIC_SENTRY_DSN");
export const SENTRY_ENABLE_DEV = getNextPublicEnv("SENTRY_ENABLE_DEV");
export const SENTRY_DEBUG = getNextPublicEnv("SENTRY_DEBUG");
export const SENTRY_ENABLED = SENTRY_DSN && (SENTRY_ENABLE_DEV.value === 'true' || process.env.NODE_ENV === 'production');

// ============================================
// EXCEPTION TRACKING - UNIFIED
// ============================================
export const EXCEPTION_TRACKING_PROVIDER = getNextPublicEnv("EXCEPTION_TRACKING_PROVIDER", "both");
export const POSTHOG_EXCEPTION_TRACKING = getNextPublicEnv("POSTHOG_EXCEPTION_TRACKING", "true");
export const SENTRY_EXCEPTION_TRACKING = getNextPublicEnv("SENTRY_EXCEPTION_TRACKING", "true");

export type ExceptionTrackingProvider = "sentry" | "posthog" | "both" | "none";