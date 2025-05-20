"use client";

import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/components/pricing/plan-card";

interface FormData {
  name: string;
  link: string;
  category: string;
  tags: string[];
  description: string;
  introduction: string;
  [key: string]: any;
}

interface ReviewSectionProps {
  formData: FormData;
  selectedPlan: PricingPlan | null;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewSection({
  formData,
  selectedPlan,
  onSubmit,
  onBack
}: ReviewSectionProps) {
  const getPlanName = () => {
    switch (selectedPlan) {
      case "pro":
        return "Pro Plan ($10)";
      case "sponsor":
        return "Sponsor Plan ($20/week)";
      default:
        return "Free Plan";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground">3 / 3 · Review and publish</p>
      
      <div className="p-6 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium mb-4">Review your submission</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Plan Selected
              </h4>
              <p className="font-medium text-primary">
                {getPlanName()}
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
              <p>{formData.tags?.length > 0 ? formData.tags.join(", ") : "None selected"}</p>
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
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <Button type="submit">
          Submit Listing
        </Button>
      </div>
    </form>
  );
}
