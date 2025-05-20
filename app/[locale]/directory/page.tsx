"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
// Components
import { PricingSection } from "@/components/pricing/pricing-section";
import { PaymentSection } from "@/components/payment/payment-section";
import { DetailsForm } from "@/components/directory/details-form";
import { ReviewSection } from "@/components/directory/review-section";

type FormStep = "pricing" | "details" | "payment" | "publish";
type PricingPlan = "free" | "pro" | "sponsor";
function DirectoryPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<FormStep>("pricing");
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState({
    link: "",
    name: "",
    category: "",
    tags: [],
    description: "",
    introduction: "",
  });

  const stepTransitions = {
    next: {
      pricing: { free: "details", pro: "payment", sponsor: "payment" },
      details: { free: "publish", pro: "payment", sponsor: "payment" },
      payment: { free: "publish", pro: "publish", sponsor: "publish" },
      publish: { free: "publish", pro: "publish", sponsor: "publish" },
    },
    prev: {
      pricing: { free: "pricing", pro: "pricing", sponsor: "pricing" },
      details: { free: "pricing", pro: "pricing", sponsor: "pricing" },
      payment: { free: "details", pro: "details", sponsor: "details" },
      publish: { free: "details", pro: "payment", sponsor: "payment" },
    },
  } as const;

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // const handleSelectChange = (name: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  useEffect(() => {
    const step = searchParams.get("step");
    const plan = searchParams.get("plan") as PricingPlan;

    if (step && ["details", "payment", "publish"].includes(step)) {
      setCurrentStep(step as FormStep);
    }

    if (plan && ["free", "pro", "sponsor"].includes(plan)) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setCurrentStep(stepTransitions.next.pricing[plan]);
  };

  const handleNextStep = () => {
    if (!selectedPlan) return;
    setCurrentStep(stepTransitions.next[currentStep][selectedPlan]);
  };

  const handlePrevStep = () => {
    if (!selectedPlan) return;
    setCurrentStep(stepTransitions.prev[currentStep][selectedPlan]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", { plan: selectedPlan, ...formData });
    // Redirect after successful submission
    // router.push("/success");
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {currentStep === "pricing" ? (
        <PricingSection onSelectPlan={handleSelectPlan} />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">Submit</h1>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "details"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  1
                </div>
                <span
                  className={currentStep === "details" ? "font-medium" : ""}
                >
                  Details
                </span>
              </div>
              <div className="h-px w-12 bg-muted self-center" />
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "payment"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <span
                  className={currentStep === "payment" ? "font-medium" : ""}
                >
                  Payment
                </span>
              </div>
              <div className="h-px w-12 bg-muted self-center" />
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "publish"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <span
                  className={currentStep === "publish" ? "font-medium" : ""}
                >
                  Publish
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === "details" && (
              <DetailsForm
                initialData={formData}
                selectedPlan={selectedPlan}
                onSubmit={(data: any) => {
                  setFormData(data);
                  handleNextStep();
                }}
                onBack={handlePrevStep}
              />
            )}

            {currentStep === "payment" && (
              <PaymentSection
                selectedPlan={selectedPlan}
                onComplete={handleNextStep}
                onBack={handlePrevStep}
              />
            )}

            {currentStep === "publish" && (
              <ReviewSection
                formData={formData}
                selectedPlan={selectedPlan}
                onSubmit={() => console.log("Listing submitted!", formData)}
                onBack={handlePrevStep}
              />
            )}
          </form>
        </>
      )}
    </div>
  );
}

export default DirectoryPage;
