"use client";

import { PlanCard, PlanFeature } from "@/components/pricing/plan-card";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type PricingPlan = "free" | "pro" | "sponsor";

interface PaymentStepProps {
  selectedPlan: PricingPlan | null;
  onPlanSelect: (plan: PricingPlan) => void;
}

export function PaymentStep({ selectedPlan, onPlanSelect }: PaymentStepProps) {
  const t = useTranslations();

  const freePlanFeatures: PlanFeature[] = [
    {
      included: true,
      text: t("pricing.FREE_PLAN_FEATURES.GET_3_DOFOLLOW_LINKS"),
    },
    {
      included: true,
      text: t("pricing.FREE_PLAN_FEATURES.PERMANENT_LINK_MAINTENANCE"),
    },
    {
      included: true,
      text: t("pricing.FREE_PLAN_FEATURES.REVIEWED_WITHIN_72_HOURS"),
    },
    {
      included: true,
      text: t("pricing.FREE_PLAN_FEATURES.PUBLISH_WHEN_YOU_WANT"),
    },
    {
      included: false,
      text: t("pricing.FREE_PLAN_FEATURES.BACKLINK_REQUIRED"),
    },
    {
      included: false,
      text: t("pricing.FREE_PLAN_FEATURES.NO_CUSTOMER_SUPPORT"),
    },
  ];

  const proPlanFeatures: PlanFeature[] = [
    {
      included: true,
      text: t("pricing.PRO_PLAN_FEATURES.GET_MORE_DOFOLLOW_LINKS"),
    },
    { included: true, text: t("pricing.PRO_PLAN_FEATURES.LIST_RIGHT_NOW") },
    {
      included: true,
      text: t("pricing.PRO_PLAN_FEATURES.PERMANENT_LINK_NO_BACKLINK"),
    },
    { included: true, text: t("pricing.PRO_PLAN_FEATURES.FEATURED_PLACEMENT") },
    { included: true, text: t("pricing.PRO_PLAN_FEATURES.SHARE_SOCIAL_MEDIA") },
    {
      included: true,
      text: t("pricing.PRO_PLAN_FEATURES.PREMIUM_CUSTOMER_SUPPORT"),
    },
  ];

  const sponsorPlanFeatures: PlanFeature[] = [
    {
      included: true,
      text: t("pricing.SPONSOR_PLAN_FEATURES.EVERYTHING_IN_PRO"),
    },
    {
      included: true,
      text: t("pricing.SPONSOR_PLAN_FEATURES.PROMOTE_ON_EVERY_PAGE"),
    },
    {
      included: true,
      text: t("pricing.SPONSOR_PLAN_FEATURES.AVAILABLE_FOR_ALL_PRODUCTS"),
    },
    {
      included: true,
      text: t("pricing.SPONSOR_PLAN_FEATURES.ONE_ADVERTISEMENT_PER_PERIOD"),
    },
    {
      included: true,
      text: t("pricing.SPONSOR_PLAN_FEATURES.SCHEDULE_ADVERTISING"),
    },
    {
      included: true,
      text: t("pricing.SPONSOR_PLAN_FEATURES.PREMIUM_CUSTOMER_SUPPORT"),
    },
  ];

  return (
    <div className="relative group animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/30 dark:to-pink-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("pricing.CHOOSE_YOUR_PERFECT_PLAN")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("pricing.DESCRIPTION")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div
            className={cn(
              "relative cursor-pointer transition-all duration-300",
              selectedPlan === "free" && "scale-105 z-10"
            )}
            onClick={() => onPlanSelect("free")}
          >
            <PlanCard
              plan="free"
              title="Free"
              price="0"
              priceUnit="€"
              features={freePlanFeatures}
              isPopular={false}
              isSelected={selectedPlan === "free"}
              onSelect={() => onPlanSelect("free")}
              actionText={t("pricing.GET_STARTED_FREE")}
              isButton={false}
              onClick={() => {}}
            />
          </div>

          {/* Pro Plan */}
          <div
            className={cn(
              "relative cursor-pointer transition-all duration-300",
              selectedPlan === "pro" && "scale-105 z-10"
            )}
            onClick={() => onPlanSelect("pro")}
          >
            <PlanCard
              plan="pro"
              title="Pro"
              price="9"
              priceUnit="€"
              features={proPlanFeatures}
              isPopular={true}
              isSelected={selectedPlan === "pro"}
              onSelect={() => onPlanSelect("pro")}
              actionText={t("pricing.UPGRADE_TO_PRO")}
              isButton={false}
              onClick={() => {}}
            />
          </div>

          {/* Sponsor Plan */}
          <div
            className={cn(
              "relative cursor-pointer transition-all duration-300",
              selectedPlan === "sponsor" && "scale-105 z-10"
            )}
            onClick={() => onPlanSelect("sponsor")}
          >
            <PlanCard
              plan="sponsor"
              title="Sponsor"
              price="99"
              priceUnit="€"
              features={sponsorPlanFeatures}
              isPopular={false}
              isSelected={selectedPlan === "sponsor"}
              onSelect={() => onPlanSelect("sponsor")}
              actionText={t("pricing.GO_ENTERPRISE")}
              isButton={false}
            />
          </div>
        </div>

        {/* Selected Plan Info */}
        {selectedPlan && (
          <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                  {t("pricing.SELECTED")}
                </p>
                <p className="text-purple-600 dark:text-purple-300 capitalize">
                  {selectedPlan === "free" && "Free"}
                  {selectedPlan === "pro" && "Pro"}
                  {selectedPlan === "sponsor" && "Sponsor"}
                  {" "}
                  {t("pricing.PLAN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 