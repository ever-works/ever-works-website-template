"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Lock } from "lucide-react";

type PricingPlan = "free" | "pro" | "sponsor";

interface PaymentSectionProps {
  selectedPlan: PricingPlan | null;
  onComplete: () => void;
  onBack: () => void;
}

export default function PaymentSection({ selectedPlan, onComplete, onBack }: PaymentSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simuler un traitement de paiement
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  const getPlanPrice = () => {
    switch (selectedPlan) {
      case "pro":
        return "$9.9";
      case "sponsor":
        return "$19.9";
      default:
        return "$0";
    }
  };

  const getPlanName = () => {
    switch (selectedPlan) {
      case "pro":
        return "Pro Plan";
      case "sponsor":
        return "Sponsor Plan";
      default:
        return "Free Plan";
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">2 / 3 · Payment details</p>
      
      <div className="p-6 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="font-medium">{getPlanName()}</span>
            <span className="font-bold">{getPlanPrice()}</span>
          </div>
          
          {selectedPlan === "sponsor" && (
            <div className="text-sm text-muted-foreground">
              Billed weekly. You can cancel anytime.
            </div>
          )}
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span>Secure payment processing by Stripe</span>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cardName" className="block font-medium">Name on card</label>
              <Input 
                id="cardName" 
                name="cardName" 
                placeholder="John Smith" 
                value={paymentInfo.cardName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="cardNumber" className="block font-medium">Card number</label>
              <div className="relative">
                <Input 
                  id="cardNumber" 
                  name="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  value={paymentInfo.cardNumber}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="expiry" className="block font-medium">Expiry date</label>
                <Input 
                  id="expiry" 
                  name="expiry" 
                  placeholder="MM/YY" 
                  value={paymentInfo.expiry}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cvc" className="block font-medium">CVC</label>
                <Input 
                  id="cvc" 
                  name="cvc" 
                  placeholder="123" 
                  value={paymentInfo.cvc}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Pay ${getPlanPrice()} Now`}
          </Button>
        </div>
      </form>
    </div>
  );
}
