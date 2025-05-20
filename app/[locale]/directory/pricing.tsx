"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type PricingPlan = "free" | "pro" | "sponsor";

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan === "free") {
      router.push("/directory?step=details");
    } else {
      router.push("/directory?step=payment");
    }
  };

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
        {/* Free Plan */}
        <div
          className={cn(
            "border rounded-lg overflow-hidden flex flex-col",
            selectedPlan === "free" ? "ring-2 ring-primary" : ""
          )}
        >
          <div className="p-6 bg-card">
            <h2 className="text-xl font-bold mb-2">FREE</h2>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-primary">$0</span>
            </div>

            <Button
              variant={selectedPlan === "free" ? "default" : "outline"}
              className="w-full"
              onClick={() => handleSelectPlan("free")}
            >
              {selectedPlan === "free" ? "Selected" : "Select Plan"}
            </Button>
          </div>

          <div className="p-6 bg-card flex-1 space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Get 3 dofollow links to boost your SEO</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Permanent link with backlink maintenance</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Reviewed and listed within 72 hours</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Publish your product the day you want</span>
            </div>
            <div className="flex items-start gap-2">
              <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                Backlink to our site is required
              </span>
            </div>
            <div className="flex items-start gap-2">
              <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">No customer support</span>
            </div>
          </div>

          <div className="p-6 bg-muted/20">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/directory?plan=free&step=details")}
            >
              Submit to review
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div
          className={cn(
            "border rounded-lg overflow-hidden flex flex-col relative",
            selectedPlan === "pro" ? "ring-2 ring-primary" : ""
          )}
        >
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <div className="bg-primary text-primary-foreground px-4 py-1 text-xs font-medium rounded-b-lg">
              POPULAR
            </div>
          </div>

          <div className="p-6 bg-card pt-8">
            <h2 className="text-xl font-bold mb-2">PRO</h2>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-primary">$10</span>
            </div>

            <Button
              variant={selectedPlan === "pro" ? "default" : "outline"}
              className="w-full"
              onClick={() => handleSelectPlan("pro")}
            >
              {selectedPlan === "pro" ? "Selected" : "Select Plan"}
            </Button>
          </div>

          <div className="p-6 bg-card flex-1 space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Get &gt; 3 dofollow links to boost your SEO</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>List right now, publish whenever you want</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Permanent link, no backlink required</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Featured placement at the top of listings</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Share through social media and newsletters</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Premium customer support</span>
            </div>
          </div>

          <div className="p-6 bg-muted/20">
            <Button
              variant="default"
              className="w-full"
              onClick={() => router.push("/directory?plan=pro&step=payment")}
            >
              Pay & Publish Right Now
            </Button>
          </div>
        </div>

        {/* Sponsor Plan */}
        <div
          className={cn(
            "border rounded-lg overflow-hidden flex flex-col",
            selectedPlan === "sponsor" ? "ring-2 ring-primary" : ""
          )}
        >
          <div className="p-6 bg-card">
            <h2 className="text-xl font-bold mb-2">SPONSOR</h2>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-primary">$20</span>
              <span className="text-muted-foreground">/ week</span>
            </div>

            <Button
              variant={selectedPlan === "sponsor" ? "default" : "outline"}
              className="w-full"
              onClick={() => handleSelectPlan("sponsor")}
            >
              {selectedPlan === "sponsor" ? "Selected" : "Select Plan"}
            </Button>
          </div>

          <div className="p-6 bg-card flex-1 space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Everything in Pro plan</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Promote your product on almost every page</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Available for all kinds of product</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Only one advertisement per period</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Schedule your advertising period</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Premium customer support</span>
            </div>
          </div>

          <div className="p-6 bg-muted/20">
            <Button
              variant="default"
              className="w-full"
              onClick={() =>
                router.push("/directory?plan=sponsor&step=payment")
              }
            >
              Pay & Publish Right Now
            </Button>
          </div>
        </div>
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
