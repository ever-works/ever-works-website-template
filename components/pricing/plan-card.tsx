"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { PaymentPlan } from "@/lib/constants";

export type PlanFeature = {
  included: boolean;
  text: string;
};


interface PlanCardProps {
  plan: PaymentPlan;
  title: string;
  price: string;
  priceUnit?: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isSelected: boolean;
  onSelect: (plan: PaymentPlan) => void;
  actionText: string;
  actionVariant?: "default" | "outline";
  actionHref?: string;
  children?: ReactNode;
  isButton?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

export function PlanCard({
  plan,
  title,
  price,
  priceUnit,
  features,
  isPopular = false,
  isSelected,
  onSelect,
  actionText,
  actionHref,
  children,
  isButton = true,
  isLoading,
  onClick,
}: PlanCardProps) {
  const router = useRouter();

  const handleAction = () => {
    if (actionHref) {
      router.push(actionHref);
    }
  };

  return (
    <article
      className={cn(
        // Base structure
        "relative flex flex-col overflow-hidden",
        "border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm",

        // Fixed dimensions for consistency
        "h-[623px] min-h-[623px] max-h-[623px]",

        // Professional shadows and transitions
        "shadow-sm hover:shadow-lg transition-all duration-300 ease-out",
        "hover:border-theme-primary-200 dark:hover:border-theme-primary-800",

        // Selection state
        isSelected && "ring-2 ring-theme-primary-500 ring-offset-2 border-theme-primary-300",

        // Popular plan enhancement
        isPopular && "scale-[1.02] shadow-md border-theme-primary-200 dark:border-theme-primary-800"
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg border border-theme-primary-400">
            POPULAR
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className={cn(
        "flex flex-col items-center justify-center text-center",
        "px-4 py-3 bg-gradient-to-b from-card to-card/80",
        "border-b border-border/30",
        "h-[130px] flex-shrink-0",
        isPopular && "pt-5"
      )}>
        <h3 className="text-base font-bold tracking-tight mb-1 text-foreground">
          {title}
        </h3>
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-2xl font-extrabold text-theme-primary-600 dark:text-theme-primary-400">
            {price}
          </span>
          {priceUnit && (
            <span className="text-muted-foreground text-xs font-medium ml-1">
              {priceUnit}
            </span>
          )}
             {children}
        </div>

        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className={cn(
            "w-full font-medium transition-all duration-200 h-8 text-xs",
            isSelected
              ? "bg-theme-primary-600 hover:bg-theme-primary-700 text-white shadow-md"
              : "border hover:border-theme-primary-300 hover:bg-theme-primary-50 dark:hover:bg-theme-primary-950"
          )}
          onClick={() => onSelect(plan)}
        >
          {isSelected ? "✓ Selected" : "Select Plan"}
        </Button>
      </header>

      {/* Features Section */}
      <section className="flex-1 px-4 py-2 bg-card/30">
        <div className="space-y-1 h-full flex flex-col justify-start gap-y-3">
          {features.map((feature, index) => (
            <div
              key={`feature-${index}`}
              className="flex items-center gap-2 group min-h-[20px]"
            >
              <div className="flex-shrink-0">
                {feature.included ? (
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <X className="w-2 h-2 text-red-500 dark:text-red-400 stroke-[3]" />
                  </div>
                )}
              </div>

              <span
                className={cn(
                  "text-sm leading-tight font-medium flex-1",
                  "transition-colors duration-200",
                  feature.included
                    ? "text-foreground group-hover:text-theme-primary-700 dark:group-hover:text-theme-primary-300"
                    : "text-muted-foreground line-through opacity-60"
                )}
                title={feature.text}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Action Button Section */}
      <footer className="px-4 py-3 bg-muted/10 border-t border-border/30 flex-shrink-0 mt-auto">
        <Button
          size="sm"
          disabled={isLoading}
          className={cn(
            "w-full font-medium text-xs h-8",
            "bg-theme-primary-600 hover:bg-theme-primary-700 text-white",
            "shadow-md hover:shadow-lg transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "rounded-md border-0",
            isLoading && "animate-pulse"
          )}
          onClick={isButton ? handleAction : onClick}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-xs">Processing...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-1 px-1">
              <span className="truncate text-sm">{actionText}</span>
              <span className="text-sm flex-shrink-0">→</span>
            </span>
          )}
        </Button>
      </footer>
    </article>
  );
}
