import { Session } from 'next-auth';
import { PricingPlanConfig } from './content';
import { PaymentInterval, PaymentPlan, PaymentProvider } from './constants';
import { paymentConfig } from '@/lib/config';

export type SessionProps = {
	session: Session | null;
};
export const defaultPricingConfig: PricingPlanConfig = {
	// Default provider
	provider: PaymentProvider.STRIPE,

	// Used, if Lemon provider is enabled. Ignored by other providers.
	lemonCheckoutUrl: '',

	currency: '$',

	plans: {
		FREE: {
			id: PaymentPlan.FREE,
			name: 'Free Plan',
			description: 'Access basic features and submit content for free.',
			price: 0,
			interval: PaymentInterval.PER_SUBMISSION,
			isActive: true,
			isPremium: false,
			isFeatured: false,
			disabled: false,
			annualDiscount: 0,
			popular: false,

			// Stripe configuration
			stripeProductId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID,
			stripePriceId: paymentConfig.stripe.freePriceId,
			annualPriceId: paymentConfig.stripe.freePriceId,

			// LemonSqueezy configuration
			lemonVariantId: paymentConfig.lemonSqueezy.freeVariantId,

			lemonCheckoutUrl: '',

			lemonProductId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_FREE_PRODUCT_ID,

			// Polar configuration
			polarFreePlanId: paymentConfig.polar.freePlanId,
			polarProductId: paymentConfig.polar.freePlanId,

			envKey: 'FREE_PLAN',
		},

		STANDARD: {
			id: PaymentPlan.STANDARD,
			name: 'Standard Plan',
			description: 'Get more visibility and unlock additional directory features.',
			price: 19,
			interval: PaymentInterval.MONTHLY,
			isActive: true,
			isPremium: true,
			isFeatured: true,

			// Stripe configuration
			stripeProductId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRODUCT_ID,
			stripePriceId: paymentConfig.stripe.standardPriceId,
			annualPriceId: paymentConfig.stripe.standardPriceId,

			// Trial configuration
			trialAmountId: paymentConfig.trial.standardTrialAmountId,
			isAuthorizedTrialAmount: paymentConfig.trial.authorized,

			annualDiscount: 10,
			disabled: false,
			popular: true,
			envKey: 'STANDARD_PLAN',
			trialPeriodDays: 4,

			// LemonSqueezy configuration
			lemonVariantId: paymentConfig.lemonSqueezy.standardVariantId,

			lemonCheckoutUrl: '',

			lemonProductId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_PRODUCT_ID,

			// Polar configuration
			polarStandardPlanId: paymentConfig.polar.standardPlanId,
			polarProductId: paymentConfig.polar.standardPlanId,
		},
		PREMIUM: {
			id: PaymentPlan.PREMIUM,
			name: 'Premium Plan',
			description: 'Maximum exposure and premium support for directory listings.',
			price: 49,
			interval: PaymentInterval.MONTHLY,
			isActive: true,
			isPremium: true,
			isFeatured: true,

			// Stripe configuration
			stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRODUCT_ID,
			stripePriceId: paymentConfig.stripe.premiumPriceId,
			annualPriceId: paymentConfig.stripe.premiumPriceId,
			annualDiscount: 10,
			disabled: true,
			trialPeriodDays: 4,
			popular: false,

			// Trial configuration
			isAuthorizedTrialAmount: paymentConfig.trial.authorized,
			trialAmountId: paymentConfig.trial.premiumTrialAmountId,

			envKey: 'PREMIUM_PLAN',

			// LemonSqueezy configuration
			lemonVariantId: paymentConfig.lemonSqueezy.premiumVariantId,

			lemonCheckoutUrl: '',

			lemonProductId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_PRODUCT_ID,

			// Polar configuration
			polarPremiumPlanId: paymentConfig.polar.premiumPlanId,
			polarProductId: paymentConfig.polar.premiumPlanId,
		},
	}
};
