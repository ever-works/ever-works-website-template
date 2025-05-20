"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlanCard, PlanFeature, PricingPlan } from "./plan-card";

interface PricingSectionProps {
  onSelectPlan?: (plan: PricingPlan) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    
    if (selectedPlan === "free") {
      router.push("/directory?plan=free&step=details");
    } else {
      router.push(`/directory?plan=${selectedPlan}&step=payment`);
    }
  };

  // Définition des fonctionnalités pour chaque plan
  const freePlanFeatures: PlanFeature[] = [
    { included: true, text: "Get 3 dofollow links to boost your SEO" },
    { included: true, text: "Permanent link with backlink maintenance" },
    { included: true, text: "Reviewed and listed within 72 hours" },
    { included: true, text: "Publish your product the day you want" },
    { included: false, text: "Backlink to our site is required" },
    { included: false, text: "No customer support" },
  ];

  const proPlanFeatures: PlanFeature[] = [
    { included: true, text: "Get > 3 dofollow links to boost your SEO" },
    { included: true, text: "List right now, publish whenever you want" },
    { included: true, text: "Permanent link, no backlink required" },
    { included: true, text: "Featured placement at the top of listings" },
    { included: true, text: "Share through social media and newsletters" },
    { included: true, text: "Premium customer support" },
  ];

  const sponsorPlanFeatures: PlanFeature[] = [
    { included: true, text: "Everything in Pro plan" },
    { included: true, text: "Promote your product on almost every page" },
    { included: true, text: "Available for all kinds of product" },
    { included: true, text: "Only one advertisement per period" },
    { included: true, text: "Schedule your advertising period" },
    { included: true, text: "Premium customer support" },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Choose Your Listing Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the plan that best fits your needs. Each plan offers different
          features and visibility options for your product listing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard
          plan="free"
          title="FREE"
          price="$0"
          features={freePlanFeatures}
          isSelected={selectedPlan === "free"}
          onSelect={handleSelectPlan}
          actionText="Submit to review"
          actionHref="/directory?plan=free&step=details"
        />

        <PlanCard
          plan="pro"
          title="PRO"
          price="$10"
          features={proPlanFeatures}
          isPopular={true}
          isSelected={selectedPlan === "pro"}
          onSelect={handleSelectPlan}
          actionText="Pay & Publish Right Now"
          actionVariant="default"
          actionHref="/directory?plan=pro&step=payment"
        />

        <PlanCard
          plan="sponsor"
          title="SPONSOR"
          price="$20"
          priceUnit="/ week"
          features={sponsorPlanFeatures}
          isSelected={selectedPlan === "sponsor"}
          onSelect={handleSelectPlan}
          actionText="Pay & Publish Right Now"
          actionVariant="default"
          actionHref="/directory?plan=sponsor&step=payment"
        />
      </div>

      {selectedPlan && (
        <div className="mt-8 text-center">
          <Button size="lg" onClick={handleContinue}>
            Continue with{" "}
            {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
          </Button>
        </div>
      )}
    </div>
  );
}
