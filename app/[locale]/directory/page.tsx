"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Icons
import { Bold, Italic, Underline, Code, Quote, List, ListOrdered, Link2, Image, HelpCircle, Check, X } from "lucide-react";

// Components
import PricingPage from "./pricing";
import PaymentSection from "./payment-section";

type FormStep = "pricing" | "details" | "payment" | "publish";
type PricingPlan = "free" | "pro" | "sponsor";

function DirectoryPage() {
  const t = useTranslations();
  const router = useRouter();
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Vérifier les paramètres d'URL au chargement de la page
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
    if (plan === "free") {
      setCurrentStep("details");
    } else {
      setCurrentStep("payment");
    }
  };

  const handleNextStep = () => {
    if (currentStep === "pricing") {
      if (selectedPlan === "free") {
        setCurrentStep("details");
      } else {
        setCurrentStep("payment");
      }
    } else if (currentStep === "details") {
      if (selectedPlan === "free") {
        setCurrentStep("publish");
      } else {
        setCurrentStep("payment");
      }
    } else if (currentStep === "payment") {
      setCurrentStep("publish");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "publish") {
      if (selectedPlan === "free") {
        setCurrentStep("details");
      } else {
        setCurrentStep("payment");
      }
    } else if (currentStep === "payment") {
      if (selectedPlan === "free") {
        setCurrentStep("pricing");
      } else {
        setCurrentStep("details");
      }
    } else if (currentStep === "details") {
      setCurrentStep("pricing");
    }
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
        <PricingPage />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">Submit</h1>
          
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === "details" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  1
                </div>
                <span className="mt-2 text-sm font-medium">Details</span>
              </div>
              <div className="h-px bg-border flex-1 mx-4"></div>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  2
                </div>
                <span className="mt-2 text-sm font-medium">Payment</span>
              </div>
              <div className="h-px bg-border flex-1 mx-4"></div>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === "publish" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  3
                </div>
                <span className="mt-2 text-sm font-medium">Publish</span>
              </div>
            </div>
          </div>
        </>
      )}

      {currentStep !== "pricing" && (
        <form
          onSubmit={handleSubmit}
          className="space-y-8 border rounded-lg p-6 bg-card text-card-foreground"
        >
          {currentStep === "payment" ? (
            <PaymentSection 
              selectedPlan={selectedPlan} 
              onComplete={handleNextStep} 
              onBack={handlePrevStep} 
            />
          ) : currentStep === "details" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              1 / 3 · Enter product details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="link" className="block font-medium">
                  Link
                </label>
                <Input
                  id="link"
                  name="link"
                  placeholder="Enter the link to your product"
                  value={formData.link}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter the name of your product"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="block font-medium">
                  Categories
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="block font-medium">
                  Tags
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="opensource">Open Source</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter a brief description of your product"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="introduction" className="block font-medium">
                  Introduction
                </label>
                <span className="text-xs text-muted-foreground">
                  (Markdown supported)
                </span>
              </div>

              <div className="border rounded-md">
                <div className="flex items-center border-b p-2 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>

                <Textarea
                  id="introduction"
                  name="introduction"
                  placeholder="Enter your content here..."
                  value={formData.introduction}
                  onChange={handleInputChange}
                  className="border-0 focus-visible:ring-0 rounded-none min-h-[200px]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === "payment" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              2 / 3 · Payment details
            </p>

            <div className="p-6 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-medium mb-4">Payment Information</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To list your product in our directory, there is a one-time fee
                of $49.99. This helps us maintain the quality of listings and
                support the platform.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="cardName" className="block font-medium">
                    Name on card
                  </label>
                  <Input id="cardName" placeholder="John Smith" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cardNumber" className="block font-medium">
                    Card number
                  </label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="expiry" className="block font-medium">
                      Expiry date
                    </label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="cvc" className="block font-medium">
                      CVC
                    </label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === "publish" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              3 / 3 · Review and publish
            </p>

            <div className="p-6 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-medium mb-4">
                Review your submission
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Plan Selected
                    </h4>
                    <p className="font-medium text-primary">
                      {selectedPlan === "pro" ? "Pro Plan ($9.9)" : 
                       selectedPlan === "sponsor" ? "Sponsor Plan ($19.9/week)" : 
                       "Free Plan"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Product Name
                    </h4>
                    <p>{formData.name || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Link
                    </h4>
                    <p>{formData.link || "Not provided"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Category
                    </h4>
                    <p>{formData.category || "Not selected"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Tags
                    </h4>
                    <p>{formData.tags.length > 0 ? formData.tags.join(", ") : "None selected"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Status
                    </h4>
                    <p className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {selectedPlan === "free" ? "Pending Review" : "Ready to Publish"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h4>
                  <p>{formData.description || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800">
                {selectedPlan === "free" 
                  ? "Once submitted, your listing will be reviewed by our team. This typically takes 1-2 business days." 
                  : "Your listing is ready to be published immediately. Click 'Submit Listing' to make it live."}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {currentStep !== "details" ? (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep !== "publish" ? (
            <Button type="button" onClick={handleNextStep}>
              Continue
            </Button>
          ) : (
            <Button type="submit">Submit Listing</Button>
          )}
        </div>
      </form>
      )}
    </div>
  );
}

export default DirectoryPage;
