import { Session } from 'next-auth';
import { PricingPlanConfig } from './content';
import { PaymentInterval, PaymentPlan, PaymentProvider } from './constants';

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
			stripePriceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
			annualPriceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
			trialDays: 0,

			// LemonSqueezy configuration
			lemonVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_FREE_VARIANT_ID,
			
			lemonCheckoutUrl: '',
			
			lemonProductId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_FREE_PRODUCT_ID,			

			// Polar configuration
			polarFreePlanId: process.env.NEXT_PUBLIC_POLAR_FREE_PLAN_ID,
			polarProductId: process.env.NEXT_PUBLIC_POLAR_FREE_PLAN_ID,

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
			stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
			annualPriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
			annualDiscount: 10,
			disabled: false,
			popular: true,
			envKey: 'PRO_PLAN',
			trialPeriodDays: 0,
			trialDays: 0,

			// LemonSqueezy configuration
			lemonVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_VARIANT_ID,
			
			lemonCheckoutUrl: '',
			
			lemonProductId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STANDARD_PRODUCT_ID,

			// Polar configuration
			polarStandardPlanId: process.env.NEXT_PUBLIC_POLAR_STANDARD_PLAN_ID,
			polarProductId: process.env.NEXT_PUBLIC_POLAR_STANDARD_PLAN_ID,
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
			stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRODUCT_ID ,
			stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID ,
			annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID ,
			annualDiscount: 10,
			disabled: true,
			trialPeriodDays: 0,
			popular: false,
			
			trialDays: 0,
			envKey: 'PREMIUM_PLAN',

			// LemonSqueezy configuration
			lemonVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID,
			
			lemonCheckoutUrl: '',
			
			lemonProductId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_PRODUCT_ID,

			// Polar configuration
			polarPremiumPlanId: process.env.NEXT_PUBLIC_POLAR_PREMIUM_PLAN_ID,
			polarProductId:process.env.NEXT_PUBLIC_POLAR_PREMIUM_PLAN_ID
		}
	}
};
