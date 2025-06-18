"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export type PlanFeature = {
  included: boolean;
  text: string;
};

export type PricingPlan = "free" | "pro" | "sponsor";

interface PlanCardProps {
  plan: PricingPlan;
  title: string;
  price: string;
  priceUnit?: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isSelected: boolean;
  onSelect: (plan: PricingPlan) => void;
  actionText: string;
  actionVariant?: "default" | "outline";
  actionHref?: string;
  children?: ReactNode;
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
  actionVariant = "outline",
  actionHref,
  children,
}: PlanCardProps) {
  const router = useRouter();

  const handleAction = () => {
    if (actionHref) {
      router.push(actionHref);
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden flex flex-col relative",
        isSelected ? "ring-2 ring-theme-primary-500" : ""
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <div className="bg-theme-primary-500 text-theme-primary-foreground px-4 py-1 text-xs font-medium rounded-b-lg">
            POPULAR
          </div>
        </div>
      )}

      <div className={cn("p-6 bg-card", isPopular && "pt-8")}>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="flex items-end gap-1 mb-6">
          <span className="text-4xl font-bold text-theme-primary-500">{price}</span>
          {priceUnit && <span className="text-muted-foreground text-theme-primary-500">{priceUnit}</span>}
        </div>

        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={() => onSelect(plan)}
        >
          {isSelected ? "Selected" : "Select Plan"}
        </Button>
      </div>

      <div className="p-6 bg-card flex-1 space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            {feature.included ? (
              <Check className="h-5 w-5 text-theme-primary-500 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 text-theme-primary-500 mt-0.5 flex-shrink-0" />
            )}
            <span className={!feature.included ? "text-muted-foreground" : ""}>
              {feature.text}
            </span>
          </div>
        ))}
        {children}
      </div>

      <div className="p-6 bg-muted/20">
        <Button
          className="w-full bg-theme-primary-500 text-white hover:bg-theme-primary-600"
          onClick={handleAction}
        >
          {actionText}
        </Button>
      </div>
    </div>
  );
}
