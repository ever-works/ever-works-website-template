"use client";

import { ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Check, X } from "lucide-react";
import { PaymentPlan, PaymentFlow } from "@/lib/constants";

export type PlanFeature = {
  readonly included: boolean;
  readonly text: string;
};

interface PlanCardProps {
  readonly plan?: PaymentPlan;
  readonly title: string;
  readonly price: string;
  readonly priceUnit?: string;
  readonly features: readonly PlanFeature[];
  readonly isPopular?: boolean;
  readonly isSelected: boolean;
  readonly onSelect?: (plan: PaymentPlan) => void;
  readonly actionText: string;
  readonly actionVariant?: "default" | "outline-solid";
  readonly actionHref?: string;
  readonly children?: ReactNode;
  readonly isButton?: boolean;
  readonly onClick?: () => void;
  readonly isLoading?: boolean;
  readonly className?: string;
  readonly selectedFlow?: PaymentFlow;
  readonly onFlowChange?: (flow: PaymentFlow) => void;
}

// Constants for modern design based on reference image
const PLAN_TYPES = {
  FREE: 'FREE',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM'
} as const;

const getButtonStyles = (title: string, isPopular: boolean) => {
  const upperTitle = title.toUpperCase();

  if (upperTitle === PLAN_TYPES.STANDARD || isPopular) {
    return "bg-linear-to-r from-theme-primary-500 to-theme-primary-600 hover:from-theme-primary-600 hover:to-theme-primary-500 text-white border-0 shadow-lg h-12 text-sm font-medium rounded-lg";
  }

  if (upperTitle === PLAN_TYPES.PREMIUM) {
    return "bg-transparent border border-slate-500/70 dark:border-slate-400/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/30 hover:border-slate-600 dark:hover:border-slate-400 h-12 text-sm font-medium rounded-lg";
  }

  return "bg-transparent border border-slate-500/70 dark:border-slate-400/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/30 hover:border-slate-600 dark:hover:border-slate-400 h-12 text-sm font-medium rounded-lg";
};

const getPriceColor = (title: string, isPopular: boolean) => {
  const upperTitle = title.toUpperCase();

  if (upperTitle === PLAN_TYPES.STANDARD || isPopular) {
    return "text-theme-primary-500";
  }

  if (upperTitle === PLAN_TYPES.PREMIUM) {
    return "text-black dark:text-white"; // Orange for "Custom"
  }

  return "text-black dark:text-white";
};

const getCardStyles = (title: string, isPopular: boolean) => {
  const upperTitle = title.toUpperCase();

  if (upperTitle === PLAN_TYPES.STANDARD || isPopular) {
    return [
      "border-slate-300/50 dark:border-slate-600/50 shadow-xl",
      "bg-white/95 dark:bg-slate-800/90",
      "scale-105 z-10", // Larger for middle card
      "max-w-[380px] min-h-[672px]" // Larger height
    ];
  }

  return [
    "border-slate-200/70 dark:border-slate-600/30 shadow-lg dark:shadow-xl",
    "bg-white/90 dark:bg-slate-800/80",
    "max-w-[380px] min-h-[674px]" // Standard height for FREE and PREMIUM
  ];
};

export function PlanCard({
  title,
  price,
  priceUnit,
  features,
  isPopular = false,
  isSelected,
  actionText,
  actionHref,
  children,
  isButton = true,
  isLoading = false,
  onClick,
  className,
  selectedFlow = PaymentFlow.PAY_AT_END,
  onFlowChange,
}: PlanCardProps) {
  const router = useRouter();
  
  const isPaidPlan = title.toUpperCase() === PLAN_TYPES.STANDARD || title.toUpperCase() === PLAN_TYPES.PREMIUM;

  const cardStyles = useMemo(() => cn(
    "relative flex flex-col",
    "w-full rounded-xl border",
    "backdrop-blur-xs transition-all duration-300 ease-out",
    "hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-1",
    (title.toUpperCase() === 'STANDARD' || isPopular) ? "mt-6" : "mt-2",

    ...getCardStyles(title, isPopular),
    isSelected && "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900",

    className
  ), [title, isPopular, isSelected, className]);

  const buttonStyles = useMemo(() => cn(
    "w-full rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "font-semibold tracking-wide",
    getButtonStyles(title, isPopular),
    isLoading && "animate-pulse"
  ), [title, isPopular, isLoading]);



  const handleAction = () => {
    if (actionHref) {
      router.push(actionHref);
    }
  };

  return (
    <article className={cardStyles}>
      {(title.toUpperCase() === 'STANDARD' || isPopular) && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-theme-primary-20 text-white px-4 py-1 rounded-full text-sm font-normal shadow-xl whitespace-nowrap">
            Most Popular
          </div>
        </div>
      )}

      <header className="flex flex-col items-start text-left px-6 pt-6 pb-4 shrink-0">
      <div className="flex items-center justify-between w-full mb-4 gap-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {isPaidPlan && onFlowChange && (
            <ToggleGroup
              options={[
                { value: PaymentFlow.PAY_AT_START, label: "Pay Now" },
                { value: PaymentFlow.PAY_AT_END, label: "Pay Later" },
              ]}
              value={selectedFlow}
              onValueChange={(value) => onFlowChange(value as PaymentFlow)}
              size="sm"
              variant="modern"
              className="flex-shrink-0"
            />
          )}
        </div>
        <div className="flex justify-center items-baseline gap-1 mb-2">
          <span className={cn(
            "text-4xl font-bold leading-none",
            getPriceColor(title, isPopular)
          )}>
            {price}
          </span>
          {priceUnit && (
            <span className="text-slate-500 dark:text-slate-400 text-sm font-normal ml-1">
              {priceUnit}
            </span>
          )}
        </div>
        {children && (
          <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            {children}
          </div>
        )}
      </header>

      {/* Features Section - Style exactly like reference image */}
      <section className="flex-1 px-6 pb-4">
        <div className="space-y-3 h-full flex flex-col justify-start">
          {features.map((feature, index) => (
            <div
              key={`feature-${index}`}
              className="flex items-start gap-3 group"
            >
              <div className="shrink-0 mt-0.5">
                {feature.included ? (
                  <Check className="w-4 h-4 text-green-500 dark:text-green-400 stroke-[2.5]" />
                ) : (
                  <X className="w-4 h-4 text-red-500 dark:text-red-400 stroke-[2.5]" />
                )}
              </div>

              <span
                className={cn(
                  "text-sm leading-relaxed flex-1 transition-colors duration-200",
                  feature.included
                    ? "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                    : "text-slate-500 dark:text-slate-500 line-through opacity-50"
                )}
                title={feature.text}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Action Button Section - Style exactly like reference image */}
      <footer className="shrink-0 mt-auto px-6 pb-6">
        <Button
          size="default"
          disabled={isLoading}
          className={buttonStyles}
          onClick={isButton ? handleAction : onClick}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          ) : (
            <span className="text-sm font-medium">
              {actionText}
            </span>
          )}
        </Button>
      </footer>
    </article>
  );
}
