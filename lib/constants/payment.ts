/**
 * Payment-related enums and types.
 * This file is kept separate from the main constants.ts to avoid
 * importing @/lib/config, which allows it to be used in scripts
 * that run outside the Next.js runtime (migrations, seeds, etc.)
 */

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
	LEMONSQUEEZY = 'lemonsqueezy',
	POLAR = 'polar'
}

export enum SubmissionStatus {
	DRAFT = 'draft',
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected',
	PUBLISHED = 'published',
	ARCHIVED = 'archived'
}
