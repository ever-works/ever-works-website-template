"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlanCard, PlanFeature, PricingPlan } from "./plan-card";
import { Check, ArrowRight, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { PaymentFlow } from "@/lib/constants";
import { PaymentFlowIndicator } from "../payment/flow-indicator";
import { usePaymentFlow } from "@/hooks/use-payment-flow";
import { PaymentFlowSelectorModal } from "../payment";
import { plans, SubscriptionPlan, useCreateCheckoutSession } from "@/hooks/use-create-checkout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";

interface PricingSectionProps {
  onSelectPlan?: (plan: PricingPlan) => void;
}

export function PricingSection({
  onSelectPlan,
}: PricingSectionProps) {
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const router = useRouter();
  const [showSelector, setShowSelector] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  

  const {
    selectedFlow,
    selectFlow,
    triggerAnimation,
  } = usePaymentFlow({
    enableAnimations: true,
    autoSave: true,
  });
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const t = useTranslations("pricing");
  const handleFlowChange = () => {
    setShowSelector(true);
  };

  const handleFlowSelect = async (flow: PaymentFlow) => {
    await selectFlow(flow);
    triggerAnimation();
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  useEffect(() => {
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl && !selectedPlan) {
      const plan = plans.find(p => p.id === planFromUrl);
      if (plan) {
        setCurrentPlan(plan);
      }
    }
  }, [searchParams, selectedPlan]);

  const calculatePrice = (plan: SubscriptionPlan) => {
    if (billingInterval === 'year' && plan.annualDiscount) {
      const annualPrice = plan.price * 12;
      return Math.round(annualPrice * (1 - plan.annualDiscount / 100));
    }
    return plan.price;
  };

  const getSavingsText = (plan: SubscriptionPlan) => {
    if (billingInterval === 'year' && plan.annualDiscount) {
      const monthlyTotal = plan.price * 12;
      const yearlyPrice = calculatePrice(plan);
      const savings = monthlyTotal - yearlyPrice;
      return `Save $${savings}/year`;
    }
    return null;
  };


  const {
    createCheckoutSession,
    isLoading,
    error,
    isSuccess,
  } = useCreateCheckoutSession();

  useEffect(() => {
    if (error) {
      toast.error('Failed to create checkout session. Please try again.');
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Checkout session created! Redirecting to Stripe...');
      // Réinitialiser l'état de traitement en cas de succès
      setProcessingPlan(null);
    }
  }, [isSuccess]);

  // Réinitialiser l'état de traitement en cas d'erreur
  useEffect(() => {
    if (error) {
      setProcessingPlan(null);
    }
  }, [error]);

  const handleCheckout = async (plan: SubscriptionPlan) => {
    if (error) {
      toast.error('Failed to create checkout session. Please try again.');
    }

    if (!user || !user.id) {
      toast.info('Please sign in to continue with your purchase.');
      router.push('/auth/signin');
      return;
    }

    // Marquer ce plan comme en cours de traitement
    setProcessingPlan(plan.id);

    try {
      await createCheckoutSession(plan, user as any, billingInterval);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      // Réinitialiser l'état de traitement
      setProcessingPlan(null);
    }
  };

  const freePlanFeatures: PlanFeature[] = [
    { included: true, text: t("FREE_PLAN_FEATURES.GET_3_DOFOLLOW_LINKS") },
    {
      included: true,
      text: t("FREE_PLAN_FEATURES.PERMANENT_LINK_MAINTENANCE"),
    },
    { included: true, text: t("FREE_PLAN_FEATURES.REVIEWED_WITHIN_72_HOURS") },
    { included: true, text: t("FREE_PLAN_FEATURES.PUBLISH_WHEN_YOU_WANT") },
    { included: false, text: t("FREE_PLAN_FEATURES.BACKLINK_REQUIRED") },
    { included: false, text: t("FREE_PLAN_FEATURES.NO_CUSTOMER_SUPPORT") },
  ];

  const proPlanFeatures: PlanFeature[] = [
    { included: true, text: t("PRO_PLAN_FEATURES.GET_MORE_DOFOLLOW_LINKS") },
    { included: true, text: t("PRO_PLAN_FEATURES.LIST_RIGHT_NOW") },
    { included: true, text: t("PRO_PLAN_FEATURES.PERMANENT_LINK_NO_BACKLINK") },
    { included: true, text: t("PRO_PLAN_FEATURES.FEATURED_PLACEMENT") },
    { included: true, text: t("PRO_PLAN_FEATURES.SHARE_SOCIAL_MEDIA") },
    { included: true, text: t("PRO_PLAN_FEATURES.PREMIUM_CUSTOMER_SUPPORT") },
  ];

  const sponsorPlanFeatures: PlanFeature[] = [
    { included: true, text: t("SPONSOR_PLAN_FEATURES.EVERYTHING_IN_PRO") },
    { included: true, text: t("SPONSOR_PLAN_FEATURES.PROMOTE_ON_EVERY_PAGE") },
    {
      included: true,
      text: t("SPONSOR_PLAN_FEATURES.AVAILABLE_FOR_ALL_PRODUCTS"),
    },
    {
      included: true,
      text: t("SPONSOR_PLAN_FEATURES.ONE_ADVERTISEMENT_PER_PERIOD"),
    },
    { included: true, text: t("SPONSOR_PLAN_FEATURES.SCHEDULE_ADVERTISING") },
    {
      included: true,
      text: t("SPONSOR_PLAN_FEATURES.PREMIUM_CUSTOMER_SUPPORT"),
    },
  ];

  return (
    <div className="relative z-10 px-4">
      {/* Enhanced Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-[#1F2937] py-2 px-4 rounded-full gap-2 text-sm font-medium">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            {t("CHOOSE_YOUR_PERFECT_PLAN")}
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300">
          {t("START_YOUR_JOURNEY")}
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 bg-clip-text text-transparent">
            {t("CHOOSE_WHAT_FITS_YOU")}
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
          {t("DESCRIPTION")}
        </p>

        {/* Trust Indicators */}
        <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/30 dark:border-gray-700/30">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-900/60">
            <Check className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("NO_HIDDEN_FEES")}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-900/60">
            <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("INSTANT_ACTIVATION")}
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
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center p-1 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/30 dark:border-gray-700/30">
          <button
            onClick={() => setBillingInterval('month')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              billingInterval === 'month'
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
              billingInterval === 'year'
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Yearly
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full">
              Save up to 25%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div
          className="relative group animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div
            className={cn(
              "relative transition-all duration-500 hover:scale-105 hover:-translate-y-2",
              selectedPlan === "free" &&
                "ring-2 ring-theme-primary-500/50 dark:ring-theme-primary-400/50"
            )}
          >
            <PlanCard
              plan="free"
              title="FREE"
              price={`$${calculatePrice(plans[0])}`}
              features={freePlanFeatures}
              isSelected={selectedPlan === "free"}
              onSelect={handleSelectPlan}
              actionText={
                error ? "Error - Try again" :
                !user ? "Sign in to continue" :
                (processingPlan === plans[0].id && isLoading) ? "Processing..." :
                "Submit to review"
              }
              actionHref="/submit"
              isLoading={processingPlan === plans[0].id && isLoading}
              isButton={false}
              onClick={() => handleCheckout(plans[0])}
            />
          </div>
        </div>

        <div
          className="relative group animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="px-4 py-1.5 bg-gradient-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 text-white text-sm font-semibold rounded-full shadow-lg">
              {t("MOST_POPULAR")}
            </div>
          </div>

          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div
            className={cn(
              "relative transition-all duration-500 hover:scale-105 hover:-translate-y-2 scale-105",
              selectedPlan === "pro" &&
                "ring-2 ring-purple-500/50 dark:ring-purple-400/50"
            )}
          >
            <PlanCard
              plan="pro"
              title="PRO"
              price={`$${calculatePrice(plans[1])}`}
              priceUnit={billingInterval === 'year' ? '/ year' : '/ month'}
              features={proPlanFeatures}
              isPopular={true}
              isSelected={selectedPlan === "pro"}
              onSelect={handleSelectPlan}
              actionText={
                error ? "Error - Try again" :
                !user ? "Sign in to continue" :
                (processingPlan === plans[1].id && isLoading) ? "Processing..." :
                "Pay & Publish Right Now"
              }
              actionVariant="default"
              actionHref="/submit"
              isLoading={processingPlan === plans[1].id && isLoading}
              isButton={false}
              onClick={() => handleCheckout(plans[1])}
            >
              {getSavingsText(plans[1]) && (
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    {getSavingsText(plans[1])}
                  </span>
                </div>
              )}
            </PlanCard>
          </div>
        </div>

        <div
          className="relative group animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div
            className={cn(
              "relative transition-all duration-500 hover:scale-105 hover:-translate-y-2",
              selectedPlan === "sponsor" &&
                "ring-2 ring-cyan-500/50 dark:ring-cyan-400/50"
            )}
          >
            <PlanCard
              plan="sponsor"
              title="SPONSOR"
              price={`$${calculatePrice(plans[2])}`}
              priceUnit={billingInterval === 'year' ? '/ year' : '/ month'}
              features={sponsorPlanFeatures}
              isSelected={selectedPlan === "sponsor"}
              onSelect={handleSelectPlan}
              actionText={
                error ? "Error - Try again" :
                !user ? "Sign in to continue" :
                (processingPlan === plans[2].id && isLoading) ? "Processing..." :
                "Pay & Publish Right Now"
              }
              actionVariant="default"
              actionHref="/submit"
              isButton={false}
              isLoading={processingPlan === plans[2].id && isLoading}
              onClick={() => handleCheckout(plans[2])}
            >
              {getSavingsText(plans[2]) && (
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    {getSavingsText(plans[2])}
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
                  {t("GREAT_CHOICE")}{" "}
                  {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}{" "}
                  {t("PLAN")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("READY_TO_GET_STARTED")}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => router.push("/submit")}
              className="h-14 px-12 rounded-xl font-semibold bg-gradient-to-r from-theme-primary-500 via-purple-500 to-theme-primary-600 hover:from-theme-primary-600 hover:via-purple-600 hover:to-theme-primary-700 text-white transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{t("CONTINUE_TO_NEXT_STEP")}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Trust Section */}
      <div
        className="mt-16 text-center animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Check,
              title: t("INSTANT_ACTIVATION"),
              desc: t("GET_STARTED_IMMEDIATELY"),
            },
            {
              icon: Zap,
              title: t("NO_SETUP_FEES"),
              desc: t("PAY_ONLY_WHAT_YOU_USE"),
            },
            {
              icon: Shield,
              title: t("PREMIUM_SUPPORT"),
              desc: t("EXPERT_ASSISTANCE"),
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                {item.desc}
              </p>
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
