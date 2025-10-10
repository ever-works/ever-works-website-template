'use client';

import { PricingSection } from '@/components/pricing/pricing-section';

interface PaymentStepProps {
	onSelectPlan?: (planId: string) => void;
}

export function PaymentStep({ onSelectPlan }: PaymentStepProps) {
	return <PricingSection isReview={true} onSelectPlan={onSelectPlan} />;
}
