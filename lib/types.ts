import { Session } from 'next-auth';
import { PricingPlanConfig } from './content';
import { PaymentInterval, PaymentPlan, PaymentProvider } from './constants';

export type SessionProps = {
	session: Session | null;
};
export const defaultPricingConfig: PricingPlanConfig = {
	provider: PaymentProvider.STRIPE, // Default provider set to Stripe, can be changed to 'lemonsqueezy' or 'manual' ,
	lemonCheckoutUrl: '', // Ignored by default as provider is 'stripe'
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
			stripeProductId: '',
			stripePriceId: '',
			annualPriceId: '',
			lemonProductId: '',
			trialDays: 0,
			envKey: 'FREE_PLAN'
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
			stripeProductId: 'price_1RlzDpKlJU1BkehBMNBX6OHI',
			stripePriceId: 'price_1RlzDpKlJU1BkehBMNBX6OHI',
			annualPriceId: 'price_1RlzDpKlJU1BkehBMNBX6OHI',
			annualDiscount: 10,
			disabled: false,
			popular: true,
			envKey: 'PRO_PLAN',
			lemonProductId: '',
			trialPeriodDays: 5,
			trialDays: 5
		},
		PREMIUM: {
			id: PaymentPlan.PREMIUM,
			name: 'Premium Plan',
			description: 'Maximum exposure and premium support for directory listings.',
			price: 49,
			interval: PaymentInterval.MONTHLY,
			isActive: true, // Disabled until integration is ready
			isPremium: true,
			isFeatured: true,
			stripeProductId: 'price_1RlzDqKlJU1BkehBszBVt6Ui',
			stripePriceId: 'price_1RlzDqKlJU1BkehBszBVt6Ui',
			annualPriceId: 'price_1RlzDqKlJU1BkehBszBVt6Ui',
			annualDiscount: 10,
			disabled: true,
			trialPeriodDays: 7,
			popular: false,
			lemonProductId: '',
			trialDays: 7,
			envKey: 'PREMIUM_PLAN'
		}
	}
};
