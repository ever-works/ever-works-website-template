import { getNextPublicEnv } from '@/env-config';

// ============================================
// LOCALIZATION
// ============================================
export const DEFAULT_LOCALE = 'en';
export const LOCALES = ['en', 'fr', 'es', 'zh', 'de', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

// ============================================
// BRANDING & UI
// ============================================
export const LOGO_URL = '/logo-ever-work-3.png';

// ============================================
// API & BACKEND
// ============================================
export const API_BASE_URL = getNextPublicEnv('NEXT_PUBLIC_API_BASE_URL');

// ============================================
// AUTHENTICATION & SECURITY
// ============================================
export const COOKIE_SECRET = getNextPublicEnv('COOKIE_SECRET');
export const JWT_ACCESS_TOKEN_EXPIRES_IN = getNextPublicEnv('JWT_ACCESS_TOKEN_EXPIRES_IN');
export const JWT_REFRESH_TOKEN_EXPIRES_IN = getNextPublicEnv('JWT_REFRESH_TOKEN_EXPIRES_IN');

// ============================================
// ANALYTICS - POSTHOG
// ============================================
export const POSTHOG_KEY = getNextPublicEnv('NEXT_PUBLIC_POSTHOG_KEY');
export const POSTHOG_HOST = getNextPublicEnv('NEXT_PUBLIC_POSTHOG_HOST');
export const POSTHOG_ENABLED = POSTHOG_KEY?.value && POSTHOG_HOST?.value;
export const POSTHOG_DEBUG = getNextPublicEnv('POSTHOG_DEBUG');

// PostHog Features
export const POSTHOG_SESSION_RECORDING_ENABLED = getNextPublicEnv('POSTHOG_SESSION_RECORDING_ENABLED', 'true');
export const POSTHOG_AUTO_CAPTURE = getNextPublicEnv('POSTHOG_AUTO_CAPTURE', 'false');

// PostHog Sampling
export const POSTHOG_SAMPLE_RATE = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
export const POSTHOG_SESSION_RECORDING_SAMPLE_RATE = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;

// PostHog API (for server-side analytics data fetching)
export const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
export const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

// ============================================
// ERROR TRACKING - SENTRY
// ============================================
export const SENTRY_DSN = getNextPublicEnv('NEXT_PUBLIC_SENTRY_DSN');
export const SENTRY_ENABLE_DEV = getNextPublicEnv('SENTRY_ENABLE_DEV');
export const SENTRY_DEBUG = getNextPublicEnv('SENTRY_DEBUG');
export const SENTRY_ENABLED =
	SENTRY_DSN?.value && (SENTRY_ENABLE_DEV?.value === 'true' || process.env.NODE_ENV === 'production');

// ============================================
// EXCEPTION TRACKING - UNIFIED
// ============================================
export const EXCEPTION_TRACKING_PROVIDER = getNextPublicEnv('EXCEPTION_TRACKING_PROVIDER', 'both');
export const POSTHOG_EXCEPTION_TRACKING = getNextPublicEnv('POSTHOG_EXCEPTION_TRACKING', 'true');
export const SENTRY_EXCEPTION_TRACKING = getNextPublicEnv('SENTRY_EXCEPTION_TRACKING', 'true');

// ============================================
// RECAPTCHA
// ============================================
export const RECAPTCHA_SITE_KEY = getNextPublicEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
export const RECAPTCHA_SECRET_KEY = getNextPublicEnv('RECAPTCHA_SECRET_KEY');

// ============================================
// PAYMENT FLOW
// ============================================
export type ExceptionTrackingProvider = 'sentry' | 'posthog' | 'both' | 'none';

export enum PaymentFlow {
	PAY_AT_START = 'pay_at_start',
	PAY_AT_END = 'pay_at_end'
}

export enum PaymentStatus {
	PENDING = 'pending',
	PAID = 'paid',
	FAILED = 'failed'
}

export enum PaymentInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ONE_TIME = 'one-time',
  PER_SUBMISSION = 'per-submission'
}

// ============================================
// PAYMENT PLANS
// ============================================
export enum PaymentPlan {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

export enum PaymentMethod {
	CREDIT_CARD = 'credit_card',
	PAYPAL = 'paypal'
}

export enum PaymentCurrency {
	USD = 'USD',
	EUR = 'EUR',
	GBP = 'GBP',
	CAD = 'CAD',
	AUD = 'AUD',
	ETH = 'ETH'
}

export enum PaymentProvider {
	STRIPE = 'stripe',
	SOLIDGATE = 'solidgate',
	LEMONSQUEEZY = 'lemonsqueezy'
}

export enum SubmissionStatus {
	DRAFT = 'draft',
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected',
	PUBLISHED = 'published',
	ARCHIVED = 'archived'
}

// ============================================
// SURVEY
// ============================================
export enum SurveyTypeEnum {
	GLOBAL = 'global',
	ITEM = 'item'
}

export enum SurveyStatusEnum {
	DRAFT = 'draft',
	PUBLISHED = 'published',
	CLOSED = 'closed'
}
