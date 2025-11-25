'use client';

import { Button } from '@/components/ui/button';
import { PlanCard } from './plan-card';
import { Check, ArrowRight, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentInterval, PaymentPlan } from '@/lib/constants';
import { PaymentFlowIndicator } from '../payment/flow-indicator';
import { PaymentFlowSelectorModal } from '../payment';
import { PricingConfig } from '@/lib/content';
import { usePricingSection } from '@/hooks/use-pricing-section';

interface PricingSectionProps {
	onSelectPlan?: (plan: PaymentPlan) => void;
	isReview?: boolean;
}

export function PricingSection({ onSelectPlan, isReview }: PricingSectionProps) {
	const {
		FREE,
		STANDARD,
		PREMIUM,
		getPlanConfig,
		getActionText,
		isLoading,
		error,
		user,
		config,
		t,
		tBilling,
		router,
		showSelector,
		setShowSelector,
		billingInterval,
		setBillingInterval,
		processingPlan,
		selectedPlan,
		selectedFlow,
		isButton,
		handleFlowChange,
		handleFlowSelect,
		handleSelectPlan,
		handleCheckout,
		calculatePrice,
		getSavingsText,
		freePlanFeatures,
		standardPlanFeatures,
		premiumPlanFeatures
	} = usePricingSection({
		onSelectPlan: onSelectPlan,
	});

	return (
		<div className="relative z-10 px-4">
			{/* Enhanced Header */}
			{!isReview && (
				<div className="text-center mb-16 animate-fade-in-up">
					<div className="flex items-center justify-center mb-6">
						<div className="flex items-center text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-[#1F2937] py-2 px-4 rounded-full gap-2 text-sm font-medium">
							<div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
							{t('CHOOSE_YOUR_PERFECT_PLAN')}
						</div>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300">
						{t('START_YOUR_JOURNEY')}
						<br className="hidden md:block" />
						<span className="bg-linear-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 bg-clip-text text-transparent">
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
			)}

			{!isReview && (
				<div className="text-center mb-8">
					<PaymentFlowIndicator
						selectedFlow={selectedFlow}
						onFlowChange={handleFlowChange}
						showChangeButton={true}
						animated={true}
					/>
				</div>
			)}
			{/* Billing Interval Selector */}
			<div className="flex justify-center mb-14">
				<div className="relative inline-flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
					<button
						onClick={() => setBillingInterval(PaymentInterval.MONTHLY)}
						className={cn(
							'relative px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 z-10 min-w-[100px]',
							billingInterval === PaymentInterval.MONTHLY
								? 'text-slate-900 dark:text-white shadow-sm'
								: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/30'
						)}
					>
						{tBilling('MONTHLY')}
					</button>
					<button
						onClick={() => setBillingInterval(PaymentInterval.YEARLY)}
						className={cn(
							'relative px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 z-10 min-w-[100px] flex items-center justify-center gap-2',
							billingInterval === PaymentInterval.YEARLY
								? 'text-slate-900 dark:text-white shadow-sm'
								: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/30'
						)}
					>
						<span>{tBilling('YEARLY')}</span>
					</button>
					{/* Enhanced sliding background */}
					<div
						className={cn(
							'absolute top-1 h-[calc(100%-8px)] bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200/50 dark:border-slate-600/50 transition-all duration-300 ease-out backdrop-blur-sm',
							billingInterval === PaymentInterval.MONTHLY
								? 'left-1 w-[calc(50%-4px)]'
								: 'left-[calc(50%+2px)] w-[calc(50%-4px)]'
						)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
				<div className="relative group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
					{/* Card Glow Effect */}
					<div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div
						className={cn(
							'relative transition-all duration-500 hover:scale-105 hover:-translate-y-2',
							selectedPlan === PaymentPlan.FREE &&
								'ring-2 ring-theme-primary-500/50 dark:ring-theme-primary-400/50'
						)}
					>
						<PlanCard
							plan={PaymentPlan.FREE}
							title={getPlanConfig(PaymentPlan.FREE).name.toUpperCase()}
							price={`${config.pricing?.currency}${FREE ? calculatePrice(FREE) : 0}`}
							priceUnit={'/month'}
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
							isButton={isButton}
							onClick={() => handleCheckout(FREE as PricingConfig)}
						>
							{FREE && getSavingsText(FREE) && (
								<div className="text-green-600 dark:text-green-400 text-sm font-medium">
									{getSavingsText(FREE)}
								</div>
							)}
						</PlanCard>
					</div>
				</div>

				<div className="relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
					{/* Popular Badge */}

					{/* Card Glow Effect */}
					<div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div
						className={cn(
							'relative transition-all duration-500 hover:scale-105 hover:-translate-y-2 scale-105',
							selectedPlan === PaymentPlan.STANDARD && 'ring-2 ring-purple-500/50 dark:ring-purple-400/50'
						)}
					>
						<PlanCard
							plan={PaymentPlan.STANDARD}
							title={getPlanConfig(PaymentPlan.STANDARD).name.toUpperCase()}
							price={`${config.pricing?.currency}${STANDARD ? calculatePrice(STANDARD) : 0}`}
							priceUnit={billingInterval === PaymentInterval.YEARLY ? '/year' : '/month'}
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
							isButton={isButton}
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
					<div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div
						className={cn(
							'relative transition-all duration-500 hover:scale-105 hover:-translate-y-2',
							selectedPlan === PaymentPlan.PREMIUM && 'ring-2 ring-cyan-500/50 dark:ring-cyan-400/50'
						)}
					>
						<PlanCard
							plan={PaymentPlan.PREMIUM}
							title={getPlanConfig(PaymentPlan.PREMIUM).name.toUpperCase()}
							price={`${config.pricing?.currency}${PREMIUM ? calculatePrice(PREMIUM) : 0}`}
							priceUnit={billingInterval === PaymentInterval.YEARLY ? '/year' : '/month'}
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
							isButton={isButton}
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
							<div className="w-12 h-12 rounded-full bg-linear-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 flex items-center justify-center">
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
							className="h-14 px-12 rounded-xl font-semibold bg-linear-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 hover:from-theme-primary-600 hover:via-purple-600 hover:to-theme-primary-700 text-white transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
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
