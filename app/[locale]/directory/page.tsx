"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// Components
import { PaymentSection } from "@/components/payment/payment-section";
import { DetailsForm } from "@/components/directory/details-form";
import { PricingSection } from "@/components/pricing/pricing-section";
import { ReviewSection } from "@/components/directory/review-section";

type FormStep = "pricing" | "details" | "payment" | "public";
type PricingPlan = "free" | "pro" | "sponsor";

function DirectoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>("pricing");
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState({
    link: "",
    name: "",
    category: "",
    tags: [] as string[],
    description: "",
    introduction: "",
  });

  const stepTransitions = {
    next: {
      pricing: { free: "details", pro: "payment", sponsor: "payment" },
      details: { free: "public", pro: "payment", sponsor: "payment" },
      payment: { free: "public", pro: "public", sponsor: "public" },
      public: { free: "public", pro: "public", sponsor: "public" },
      
    },
    prev: {
      pricing: { free: "pricing", pro: "pricing", sponsor: "pricing" },
      details: { free: "pricing", pro: "pricing", sponsor: "pricing" },
      payment: { free: "details", pro: "details", sponsor: "details" },
      public: { free: "details", pro: "payment", sponsor: "payment" },
    },
  } as const;

  // Update URL when step or plan changes
  const updateURL = (step: FormStep, plan: PricingPlan | null) => {
    const params = new URLSearchParams();
    if (step !== "pricing") params.set("step", step);
    if (plan) params.set("plan", plan);
    
    const url = params.toString() ? `/directory?${params.toString()}` : "/directory";
    router.replace(url);
  };

  useEffect(() => {
    const step = searchParams.get("step");
    const plan = searchParams.get("plan") as PricingPlan;

    // Set step from URL params
    if (step && ["details", "payment", "public"].includes(step)) {
      setCurrentStep(step as FormStep);
    } else {
      setCurrentStep("pricing");
    }

    // Set plan from URL params
    if (plan && ["free", "pro", "sponsor"].includes(plan)) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    const nextStep = stepTransitions.next.pricing[plan];
    setCurrentStep(nextStep);
    updateURL(nextStep, plan);
  };

  const handleNextStep = () => {
    if (!selectedPlan) return;
    const nextStep = stepTransitions.next[currentStep][selectedPlan];
    setCurrentStep(nextStep);
    updateURL(nextStep, selectedPlan);
  };

  const handlePrevStep = () => {
    if (!selectedPlan) return;
    const prevStep = stepTransitions.prev[currentStep][selectedPlan];
    setCurrentStep(prevStep);
    updateURL(prevStep, selectedPlan);
  };

  const handleFormSubmit = (data: typeof formData) => {
    setFormData(data);
    handleNextStep();
  };

  const handlePaymentComplete = () => {
    handleNextStep();
  };

  const handleFinalSubmit = () => {
    // Handle final form submission logic here
    console.log("Final submission:", { plan: selectedPlan, ...formData });
    // You can redirect to a success page here
    // router.push("/success");
    alert("Listing submitted successfully!");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 py-20">
      <div className="container mx-auto px-4">
        {currentStep === "pricing" ? (
          <PricingSection onSelectPlan={handleSelectPlan} />
        ) : (
          <>
            {currentStep === "details" && (
              <DetailsForm
                initialData={formData}
                selectedPlan={selectedPlan}
                onSubmit={handleFormSubmit}
                onBack={handlePrevStep}
              />
            )}

            {currentStep === "payment" && (
              <PaymentSection
                selectedPlan={selectedPlan}
                onComplete={handlePaymentComplete}
                onBack={handlePrevStep}
              />
            )}

            {currentStep === "public" && (
              <ReviewSection
                formData={formData}
                selectedPlan={selectedPlan}
                onSubmit={handleFinalSubmit}
                onBack={handlePrevStep}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DirectoryPage;
