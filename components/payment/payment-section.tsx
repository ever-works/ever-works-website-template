"use client";

import { useState } from "react";
import { CreditCardForm } from "./credit-card-form";
import { PricingPlan } from "@/components/pricing/plan-card";

interface PaymentSectionProps {
  selectedPlan: PricingPlan | null;
  onComplete: () => void;
  onBack: () => void;
}

interface CardDetails {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export function PaymentSection({ 
  selectedPlan, 
  onComplete, 
  onBack 
}: PaymentSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getPlanPrice = () => {
    switch (selectedPlan) {
      case "pro":
        return "$10";
      case "sponsor":
        return "$20";
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

  const handlePaymentSubmit = async (cardDetails: CardDetails) => {
    setIsProcessing(true);
    
    try {
      // Ici, vous intégreriez l'appel à l'API Stripe
      console.log("Processing payment for", getPlanName());
      console.log("Card details:", cardDetails);
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Paiement réussi
      onComplete();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
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
        </div>
      </div>
      
      <CreditCardForm 
        onSubmit={handlePaymentSubmit}
        onCancel={onBack}
        amount={getPlanPrice()}
        isProcessing={isProcessing}
        buttonText={`Pay ${getPlanPrice()} Now`}
      />
    </div>
  );
}
