'use client';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  annualPriceId?: string;
  interval: 'month' | 'year';
  currency: string;
  features: string[];
  popular?: boolean;
  trialDays?: number;
  disabled?: boolean;
  annualDiscount?: number;
}

export interface SubscriptionFormProps {
  selectedPlan?: SubscriptionPlan;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
}

export const isStripeConfigured = !!(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID &&
    process.env.NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID
  );


  export const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: 'free',
      interval: 'month',
      currency: 'USD',
      features: [
        'Submit 1 tool per month',
        'Basic listing',
        'Community support',
        'Standard review process'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 10,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_missing',
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || 'price_missing',
      interval: 'month',
      currency: 'USD',
      features: [
        'Submit unlimited tools',
        'Priority listing',
        'Featured placement',
        'Premium support',
        'Fast-track review',
        'Analytics dashboard'
      ],
      popular: true,
      trialDays: 7,
      disabled: !isStripeConfigured,
      annualDiscount: 20
    },
    {
      id: 'sponsor',
      name: 'Sponsor',
      price: 20,
      priceId: process.env.NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID || 'price_missing',
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_SPONSOR_ANNUAL_PRICE_ID || 'price_missing',
      interval: 'month',
      currency: 'USD',
      features: [
        'Everything in Pro',
        'Homepage banner',
        'Newsletter mention',
        'Social media promotion',
        'Dedicated account manager',
        'Custom integrations'
      ],
      disabled: !isStripeConfigured,
      annualDiscount: 25
    }
  ];

 interface User {
  id: string;
  email: string;
  name: string;
  image: string;
}

export interface CheckoutSessionPayload {
  priceId: string;
  mode: 'subscription';
  trialPeriodDays: number;
  billingInterval: 'month' | 'year';
  successUrl: string;
  cancelUrl: string;
  customerId: string;
  metadata: {
    planId: string;
    planName: string;
    billingInterval: 'month' | 'year';
    userId: string;
    email?: string;
  };
}

interface CheckoutSessionResponse {
  id?: string;
  url?: string;
  error?: string;
}

class CheckoutSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutSessionError';
  }
}


export const useCreateCheckoutSession = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async ({
      plan,
      user,
      billingInterval,
    }: {
      plan: SubscriptionPlan;
      user: User | null;
      billingInterval: 'month' | 'year';
    }): Promise<string> => {
      if (!user) {
        // Rediriger vers la page de connexion sans lancer d'erreur
        router.push('/auth/signin');
        // Retourner une promesse qui ne se résout jamais pour éviter l'erreur
        return new Promise(() => {});
      }
      const priceId = billingInterval === 'year' ? plan.annualPriceId : plan.priceId;
      if (!priceId) {
        throw new CheckoutSessionError('Invalid price ID');
      }

      const payload: CheckoutSessionPayload = {
        priceId,
        mode: 'subscription',
        trialPeriodDays: plan.trialDays || 0,
        billingInterval,
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/subscription?cancelled=true`,
        customerId: user.id,
        metadata: {
          planId: plan.id,
          planName: plan.name,
          billingInterval,
          userId: user.id,
        },
      };

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new CheckoutSessionError(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // L'API retourne { data: { id, url }, status, message }
      const data = responseData.data || responseData;

      if (responseData.error) {
        throw new CheckoutSessionError(responseData.error);
      }
      if (!data.id) {
        throw new CheckoutSessionError('No session ID returned from server');
      }

      // Si une URL de checkout est fournie, rediriger automatiquement
      if (data.url) {
        window.location.href = data.url;
      }

      return data.id;
    },
  });

  const createCheckoutSession = (
    plan: SubscriptionPlan,
    user: User | null,
    billingInterval: 'month' | 'year'
  ) => {
    return mutation.mutateAsync({ plan, user, billingInterval });
  };

  return {
    createCheckoutSession,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
    data: mutation.data,
    
  };
};
