import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PaymentFlow, PaymentInterval, PaymentPlan, PaymentProvider } from '@/lib/constants';
import { usePaymentFlow } from '@/hooks/use-payment-flow';
import { useCreateCheckoutSession } from '@/hooks/use-create-checkout';
import { useCurrentUser } from '@/hooks/use-current-user';
import { toast } from 'sonner';
import { usePricingFeatures } from '@/hooks/use-pricing-features';
import { useConfig } from '@/app/[locale]/config';
import { PricingConfig } from '@/lib/content';
import { useLoginModal } from './use-login-modal';
import { useCheckoutButton } from './use-checkout-button';

export interface UsePricingSectionParams {
	onSelectPlan?: (plan: PaymentPlan) => void;
}

export interface UsePricingSectionState {
	showSelector: boolean;
	billingInterval: PaymentInterval;
	processingPlan: string | null;
	selectedPlan: PaymentPlan | null;
	selectedFlow: PaymentFlow;
	isButton: boolean;
}

export interface UsePricingSectionActions {
	setShowSelector: (show: boolean) => void;
	setBillingInterval: (interval: PaymentInterval) => void;
	setSelectedPlan: (plan: PaymentPlan | null) => void;
	handleFlowChange: () => void;
	handleFlowSelect: (flow: PaymentFlow) => Promise<void>;
	handleSelectPlan: (plan: PaymentPlan) => void;
	handleCheckout: (plan: PricingConfig) => Promise<void>;
	calculatePrice: (plan: PricingConfig) => number;
	getSavingsText: (plan: PricingConfig) => string | null;
}

export interface UsePricingSectionReturn extends UsePricingSectionState, UsePricingSectionActions {
	// Additional data
	user: any;
	config: any;
	FREE: any;
	STANDARD: any;
	PREMIUM: any;
	provider?: PaymentProvider;
	freePlanFeatures: any[];
	standardPlanFeatures: any[];
	premiumPlanFeatures: any[];
	getPlanConfig: (planId: string) => any;
	getActionText: (planId: string) => string;
	isLoading: boolean;
	error: any;
	isSuccess: boolean;
	t: any;
	tBilling: any;
	router: any;
}

/**
 * Custom hook that encapsulates all PricingSection logic
 */
export function usePricingSection(params: UsePricingSectionParams = {}): UsePricingSectionReturn {
	const { onSelectPlan } = params;
	// Hooks
	const searchParams = useSearchParams();
	const router = useRouter();
	const { user } = useCurrentUser();
	const config = useConfig();
	const t = useTranslations('pricing');
	const tBilling = useTranslations('billing');

	const { freePlanFeatures, standardPlanFeatures, premiumPlanFeatures, getPlanConfig, getActionText } =
		usePricingFeatures();

	const stripeHook = useCreateCheckoutSession();
	const lemonsqueezyHook = useCheckoutButton();

	const { selectedFlow, selectFlow, triggerAnimation } = usePaymentFlow({
		enableAnimations: true,
		autoSave: true
	});

  // Local state
  const [showSelector, setShowSelector] = useState(false);
  const [billingInterval, setBillingInterval] = useState<PaymentInterval>(PaymentInterval.MONTHLY);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const loginModal = useLoginModal();

	// Extract plan configurations
	const { FREE, STANDARD, PREMIUM } = config.pricing?.plans ?? {};
	const paymentHook = config.pricing?.provider === PaymentProvider.LEMONSQUEEZY ? lemonsqueezyHook : stripeHook;
	const { isLoading, isError, isSuccess, error } = paymentHook;

	/**
	 * Handle flow change
	 */
	const handleFlowChange = useCallback(() => {
		setShowSelector(true);
	}, []);

	/**
	 * Handle flow selection
	 */
	const handleFlowSelect = useCallback(
		async (flow: PaymentFlow) => {
			await selectFlow(flow);
			triggerAnimation();
		},
		[selectFlow, triggerAnimation]
	);

	/**
	 * Handle plan selection
	 */
	const handleSelectPlan = useCallback(
		(plan: PaymentPlan) => {
			setSelectedPlan(plan);
			if (onSelectPlan) {
				onSelectPlan(plan);
			}
		},
		[onSelectPlan]
	);

	/**
	 * Calculate price based on billing interval and discounts
	 */
	const calculatePrice = useCallback(
		(plan: PricingConfig): number => {
			if (billingInterval !== PaymentInterval.YEARLY || !plan.annualDiscount) {
				return plan.price;
			}

			const annualPrice = plan.price * 12;
			const discountMultiplier = 1 - plan.annualDiscount / 100;

			return Math.round(annualPrice * discountMultiplier);
		},
		[billingInterval]
	);

	/**
	 * Get savings text for yearly billing
	 */
	const getSavingsText = useCallback(
		(plan: PricingConfig): string | null => {
			if (billingInterval !== PaymentInterval.YEARLY || !plan.annualDiscount) {
				return null;
			}

			const monthlyTotal = plan.price * 12;
			const yearlyPrice = calculatePrice(plan);
			const savings = monthlyTotal - yearlyPrice;
			return `Save $${savings}/year`;
		},
		[billingInterval, calculatePrice]
	);

  /**
   * Handle checkout process
   */
  const handleCheckout = useCallback(async (plan: PricingConfig) => {
    if (!user?.id) {
      loginModal.onOpen('Please sign in to continue with your purchase.');
      return;
    }

			if (processingPlan) {
				toast.warning('Please wait, processing your previous request...');
				return;
			}

			setProcessingPlan(plan.id);

			try {
				if (config.pricing?.provider === PaymentProvider.LEMONSQUEEZY) {
					if(!plan.lemonVariantId) {
						toast.error('No variant ID found for plan');
						return;
					}
					await lemonsqueezyHook.handleSubmitWithParams({
						variantId: Number(plan.lemonVariantId),
						defaultPrice: plan.price,
						metadata: {
							source: 'checkout-button',
							timestamp: new Date().toISOString(),
							planId: plan.id,
							planName: plan.name,
							billingInterval: billingInterval,
							userId: user.id,
							email: user.email
						},
						embedded: false
					});
				} else {
					await stripeHook.createCheckoutSession(plan, user as any, billingInterval);
				}
			} catch (checkoutError) {
				console.error('Checkout error:', checkoutError);
				toast.error('Failed to create checkout session. Please try again.');
			} finally {
				setProcessingPlan(null);
			}
		},
		[
			user,
			router,
			processingPlan,
			lemonsqueezyHook.handleSubmitWithParams,
			stripeHook.createCheckoutSession,
			billingInterval
		]
	);

	// Computed values
	const isButton = selectedFlow === 'pay_at_end';

	// Effects
	useEffect(() => {
		const planFromUrl = searchParams.get('plan');
		const availablePlans = [FREE, STANDARD, PREMIUM];

		if (!planFromUrl || selectedPlan) return;

		const matchedPlan = availablePlans.find((plan) => plan?.id === planFromUrl);

		if (matchedPlan) {
			console.log('Plan selected from URL:', matchedPlan.id);
		}
	}, [searchParams, selectedPlan, FREE, STANDARD, PREMIUM]);

	useEffect(() => {
		if (error) {
			toast.error('Failed to create checkout session. Please try again.');
			setProcessingPlan(null);
			return;
		}

		if (isSuccess) {
			toast.success(`Checkout session created! Redirecting to ${config.pricing?.provider}...`);
			setProcessingPlan(null);
		}
	}, [error, isSuccess]);

	return {
		// State
		showSelector,
		billingInterval,
		processingPlan,
		selectedPlan,
		selectedFlow,
		isButton,

		// Actions
		setShowSelector,
		setBillingInterval,
		setSelectedPlan,
		handleFlowChange,
		handleFlowSelect,
		handleSelectPlan,
		handleCheckout,
		calculatePrice,
		getSavingsText,

		// Data
		user,
		config,
		FREE,
		STANDARD,
		PREMIUM,
		freePlanFeatures,
		standardPlanFeatures,
		premiumPlanFeatures,
		getPlanConfig: (planId: string) => getPlanConfig(planId as PaymentPlan),
		getActionText: (planId: string) => getActionText(planId as PaymentPlan),
		isLoading,
		error,
		provider: config.pricing?.provider,
		isSuccess,
		t,
		tBilling,
		router
	};
}
