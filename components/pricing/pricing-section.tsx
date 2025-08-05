'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlanCard } from './plan-card';
import { Check, ArrowRight, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { PaymentFlow, PaymentInterval, PaymentPlan } from '@/lib/constants';
import { PaymentFlowIndicator } from '../payment/flow-indicator';
import { usePaymentFlow } from '@/hooks/use-payment-flow';
import { PaymentFlowSelectorModal } from '../payment';
import { useCreateCheckoutSession } from '@/hooks/use-create-checkout';
import { useCurrentUser } from '@/hooks/use-current-user';
import { toast } from 'sonner';
import { usePricingFeatures } from '@/hooks/use-pricing-features';
import { useConfig } from '@/app/[locale]/config';
import { PricingConfig } from '@/lib/content';

interface PricingSectionProps {
	onSelectPlan?: (plan: PaymentPlan) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
	const searchParams = useSearchParams();
	const { user } = useCurrentUser();
	const { freePlanFeatures, standardPlanFeatures, premiumPlanFeatures, getPlanConfig, getActionText } =
		usePricingFeatures();
	const router = useRouter();
	const t = useTranslations('pricing');
	const tBilling = useTranslations('billing');
	const [showSelector, setShowSelector] = useState(false);
	// Removed unused currentPlan state
	const [billingInterval, setBillingInterval] = useState<PaymentInterval>(PaymentInterval.MONTHLY);
	const [processingPlan, setProcessingPlan] = useState<string | null>(null);
	const config = useConfig();
	const { FREE, STANDARD, PREMIUM } = config.pricing?.plans ?? {};
	const { createCheckoutSession, isLoading, error, isSuccess } = useCreateCheckoutSession();

	const { selectedFlow, selectFlow, triggerAnimation } = usePaymentFlow({
		enableAnimations: true,
		autoSave: true
	});
	const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
	const handleFlowChange = () => {
		setShowSelector(true);
	};

	const handleFlowSelect = async (flow: PaymentFlow) => {
		await selectFlow(flow);
		triggerAnimation();
	};

	const handleSelectPlan = (plan: PaymentPlan) => {
		setSelectedPlan(plan);
		if (onSelectPlan) {
			onSelectPlan(plan);
		}
	};

	// Memoized available plans to prevent unnecessary re-renders

	// Handle plan selection from URL parameters with proper error handling
	useEffect(() => {
		const planFromUrl = searchParams.get('plan');
		const availablePlans = [FREE, STANDARD, PREMIUM];
		if (!planFromUrl || selectedPlan) return;

		const matchedPlan = availablePlans.find((plan) => plan?.id === planFromUrl);

		if (matchedPlan) {
			// Plan found from URL - could be used for analytics or other purposes
			console.log('Plan selected from URL:', matchedPlan.id);
		}
	}, [searchParams, selectedPlan, FREE, STANDARD, PREMIUM]);

	const calculatePrice = useCallback(
		(plan: PricingConfig): number => {
			if (billingInterval !==PaymentInterval?.YEARLY || !plan.annualDiscount) {
				return plan.price;
			}

			const annualPrice = plan.price * 12;
			const discountMultiplier = 1 - plan.annualDiscount / 100;

			return Math.round(annualPrice * discountMultiplier);
		},
		[billingInterval]
	);

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

	useEffect(() => {
		if (error) {
			toast.error('Failed to create checkout session. Please try again.');
			setProcessingPlan(null);
			return;
		}

		if (isSuccess) {
			toast.success('Checkout session created! Redirecting to Stripe...');
			setProcessingPlan(null);
		}
	}, [error, isSuccess]);

	const handleCheckout = useCallback(
		async (plan: PricingConfig) => {
			if (!user?.id) {
				toast.info('Please sign in to continue with your purchase.');
				router.push('/auth/signin');
				return;
			}

			if (processingPlan) {
				toast.warning('Please wait, processing your previous request...');
				return;
			}

			setProcessingPlan(plan.id);

			try {
				await createCheckoutSession(plan, user as any, billingInterval);
			} catch (checkoutError) {
				console.error('Checkout error:', checkoutError);
				toast.error('Failed to create checkout session. Please try again.');
				setProcessingPlan(null);
			}
		},
		[user, router, processingPlan, createCheckoutSession, billingInterval]
	);

	return (
		<div className="relative z-10 px-4">
			{/* Enhanced Header */}
			<div className="text-center mb-16 animate-fade-in-up">
				<div className="flex items-center justify-center mb-6">
					<div className="flex items-center text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-[#1F2937] py-2 px-4 rounded-full gap-2 text-sm font-medium">
						<div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
						{t('CHOOSE_YOUR_PERFECT_PLAN')}
					</div>
				</div>
				<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300">
					{t('START_YOUR_JOURNEY')}
					<br className="hidden md:block" />
					<span className="bg-gradient-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 bg-clip-text text-transparent">
						{t('CHOOSE_WHAT_FITS_YOU')}
					</span>
				</h1>

				<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
					{t('DESCRIPTION')}
				</p>

				{/* Trust Indicators */}
				<div className="mt-8 inline-flex items-center gap-3 p-1 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/30 dark:border-gray-700/30">
					<div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-900/60">
						<Check className="w-4 h-4 text-gray-600 dark:text-gray-400" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{t('NO_HIDDEN_FEES')}
						</span>
					</div>
					<div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-900/60">
						<Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{t('INSTANT_ACTIVATION')}
						</span>
					</div>
				</div>
			</div>

			<div className="text-center mb-8">
				<PaymentFlowIndicator
					selectedFlow={selectedFlow}
					onFlowChange={handleFlowChange}
					showChangeButton={true}
					animated={true}
				/>
			</div>

			{/* Billing Interval Selector */}
			<div className="flex justify-center mb-6">
				<div className="relative inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
					<button
						onClick={() => setBillingInterval(PaymentInterval.MONTHLY)}
						className={cn(
							'relative px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 z-10',
							billingInterval === PaymentInterval.MONTHLY
								? 'text-gray-900 dark:text-white'
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
						)}
					>
						{tBilling('MONTHLY')}
					</button>
					<button
						onClick={() => setBillingInterval(PaymentInterval.YEARLY)}
						className={cn(
							'relative px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 z-10',
							billingInterval === PaymentInterval.YEARLY
								? 'text-gray-900 dark:text-white'
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
						)}
					>
						{tBilling('YEARLY')}
						{billingInterval === PaymentInterval.YEARLY && (
							<span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-green-500 text-white rounded">
								{tBilling('SAVE_UP_TO')}
							</span>
						)}
					</button>
					{/* Sliding background */}
					<div
						className={cn(
							'absolute top-0.5 h-[calc(100%-4px)] bg-white dark:bg-gray-700 rounded-md shadow-sm transition-all duration-200 ease-out',
							billingInterval === PaymentInterval.MONTHLY
								? 'left-0.5 w-[calc(50%-2px)]'
								: 'left-[calc(50%+2px)] w-[calc(50%-2px)]'
						)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
				<div className="relative group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
					{/* Card Glow Effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div
						className={cn(
							'relative transition-all duration-500 hover:scale-105 hover:-translate-y-2',
							selectedPlan === PaymentPlan.FREE && 'ring-2 ring-theme-primary-500/50 dark:ring-theme-primary-400/50'
						)}
					>
						<PlanCard
							plan={PaymentPlan.FREE}
							title={getPlanConfig(PaymentPlan.FREE).name.toUpperCase()}
							price={`${config.pricing?.currency}${FREE?.price}`}
							priceUnit={getPlanConfig(PaymentPlan.FREE).period}
							features={freePlanFeatures}
							isSelected={selectedPlan === PaymentPlan.FREE}
							onSelect={handleSelectPlan}
							actionText={
								error
									? tBilling('ERROR_TRY_AGAIN')
									: !user
										? tBilling('SIGN_IN_TO_CONTINUE')
										: processingPlan === FREE?.id && isLoading
											? tBilling('PROCESSING')
											: getActionText(PaymentPlan.FREE)
							}
							actionHref="/submit"
							isLoading={processingPlan === FREE?.id && isLoading}
							isButton={false}
							onClick={() => handleCheckout(FREE as PricingConfig)}
						/>
					</div>
				</div>

				<div className="relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
					{/* Popular Badge */}

					{/* Card Glow Effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div
						className={cn(
							'relative transition-all duration-500 hover:scale-105 hover:-translate-y-2 scale-105',
							selectedPlan === PaymentPlan.STANDARD && 'ring-2 ring-purple-500/50 dark:ring-purple-400/50'
						)}
					>
						<PlanCard
							plan={PaymentPlan.STANDARD}
							title={getPlanConfig(PaymentPlan.STANDARD).name.toUpperCase()}
							price={`${config.pricing?.currency}${STANDARD?.price}`}
							priceUnit={getPlanConfig(PaymentPlan.STANDARD).period}
							features={standardPlanFeatures}
							isPopular={true}
							isSelected={selectedPlan === STANDARD?.id}
							onSelect={handleSelectPlan}
							actionText={
								error
									? tBilling('ERROR_TRY_AGAIN')
									: !user
										? tBilling('SIGN_IN_TO_CONTINUE')
										: processingPlan === STANDARD?.id && isLoading
											? tBilling('PROCESSING')
											: getActionText(PaymentPlan.STANDARD)
							}
							actionVariant="default"
							actionHref="/submit"
							isLoading={processingPlan === STANDARD?.id && isLoading}
							isButton={false}
							onClick={() => handleCheckout(STANDARD as PricingConfig)}
						>
							{getSavingsText(STANDARD as PricingConfig) && (
								<div className="text-center">
									<span className="inline-block px-3 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
										{getSavingsText(STANDARD as PricingConfig)}
									</span>
								</div>
							)}
						</PlanCard>
					</div>
				</div>

				<div className="relative group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
					{/* Card Glow Effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div
						className={cn(
							'relative transition-all duration-500 hover:scale-105 hover:-translate-y-2',
							selectedPlan === PaymentPlan.PREMIUM && 'ring-2 ring-cyan-500/50 dark:ring-cyan-400/50'
						)}
					>
						<PlanCard
							plan={PaymentPlan.PREMIUM}
							title={getPlanConfig(PaymentPlan.PREMIUM).name.toUpperCase()}
							price={`${config.pricing?.currency}${PREMIUM?.price}`}
							priceUnit={getPlanConfig(PaymentPlan.PREMIUM).period}
							features={premiumPlanFeatures}
							isSelected={selectedPlan === PREMIUM?.id}
							onSelect={handleSelectPlan}
							actionText={
								error
									? tBilling('ERROR_TRY_AGAIN')
									: !user
										? tBilling('SIGN_IN_TO_CONTINUE')
										: processingPlan === PREMIUM?.id && isLoading
											? tBilling('PROCESSING')
											: getActionText(PaymentPlan.PREMIUM)
							}
							actionVariant="default"
							actionHref="/submit"
							isButton={false}
							isLoading={processingPlan === PREMIUM?.id && isLoading}
							onClick={() => handleCheckout(PREMIUM as PricingConfig)}
						>
							{getSavingsText(PREMIUM as PricingConfig) && (
								<div className="text-center">
									<span className="inline-block px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
										{getSavingsText(PREMIUM as PricingConfig)}
									</span>
								</div>
							)}
						</PlanCard>
					</div>
				</div>
			</div>

			{/* Enhanced Continue Section */}
			{selectedPlan && (
				<div className="text-center animate-fade-in-up">
					<div className="inline-flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-full bg-gradient-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 flex items-center justify-center">
								<Check className="w-6 h-6 text-white" />
							</div>
							<div className="text-left">
								<p className="text-lg font-semibold text-gray-900 dark:text-white">
									{t('GREAT_CHOICE')} {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}{' '}
									{t('PLAN')}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-300">{t('READY_TO_GET_STARTED')}</p>
							</div>
						</div>

						<Button
							size="lg"
							onClick={() => router.push('/submit')}
							className="h-14 px-12 rounded-xl font-semibold bg-gradient-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 hover:from-theme-primary-600 hover:via-purple-600 hover:to-theme-primary-700 text-white transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
						>
							<div className="flex items-center gap-3">
								<span className="text-lg">{t('CONTINUE_TO_NEXT_STEP')}</span>
								<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
							</div>
						</Button>
					</div>
				</div>
			)}

			{/* Trust Section */}
			<div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					{[
						{
							icon: Check,
							title: t('INSTANT_ACTIVATION'),
							desc: t('GET_STARTED_IMMEDIATELY')
						},
						{
							icon: Zap,
							title: t('NO_SETUP_FEES'),
							desc: t('PAY_ONLY_WHAT_YOU_USE')
						},
						{
							icon: Shield,
							title: t('PREMIUM_SUPPORT'),
							desc: t('EXPERT_ASSISTANCE')
						}
					].map((item, index) => (
						<div
							key={index}
							className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105"
						>
							<div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
								<item.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
							</div>
							<h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
							<p className="text-sm text-gray-600 dark:text-gray-300 text-center">{item.desc}</p>
						</div>
					))}
				</div>
			</div>
			<PaymentFlowSelectorModal
				selectedFlow={selectedFlow}
				onFlowSelect={handleFlowSelect}
				isOpen={showSelector}
				onClose={() => setShowSelector(false)}
			/>
		</div>
	);
}
