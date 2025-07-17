'use client';

import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useTranslations } from 'next-intl';
import { PaymentFormProps } from '../../types/payment-types';
import { Button } from '@heroui/react';

// Wrapper with Stripe Elements
interface StripeElementsWrapperProps extends PaymentFormProps {
  stripePublicKey: string;
  isSubscription: boolean;
}

// Stripe payment form component
export function StripePaymentForm({
  onSuccess,
  onError,
  clientSecret,
  successUrl,
  isSubscription,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);
  const t = useTranslations('payment');
  const tForm = useTranslations('payment.form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessed || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // First, retrieve the PaymentIntent to check its status
      const { paymentIntent: existingIntent } = await stripe.retrievePaymentIntent(clientSecret);
      
      if (existingIntent && existingIntent.status === 'succeeded') {
        setIsProcessed(true);
        onSuccess(existingIntent.id);
        return;
      }

      if (isSubscription) {
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: successUrl,
          },
          redirect: 'if_required',
        });

        if (error) {
          setErrorMessage(error.message || tForm('error.setup'));
          onError(new Error(error.message || tForm('error.setup')));
          return;
        }

        if (setupIntent && setupIntent.status === 'succeeded') {
          setIsProcessed(true);
          onSuccess(setupIntent.payment_method as string);
        }
      } else {
        // Confirm the payment only if it hasn't been processed
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: successUrl,
            payment_method_data: {
              billing_details: {}
            }
          },
          redirect: 'if_required',
        });

        if (error) {
          setErrorMessage(error.message || tForm('error.default'));
          onError(new Error(error.message || tForm('error.default')));
          return;
        }

        if (paymentIntent) {
          switch (paymentIntent.status) {
            case 'succeeded':
              setIsProcessed(true);
              onSuccess(paymentIntent.id);
              break;
            case 'processing':
              setErrorMessage(tForm('processing'));
              break;
            case 'requires_payment_method':
              setErrorMessage(tForm('error.payment_method_required'));
              break;
            default:
              setErrorMessage(tForm('error.unexpected'));
              break;
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(tForm('error.unexpected'));
      onError(error instanceof Error ? error : new Error(tForm('error.unexpected')));
    } finally {
      setIsLoading(false);
    }
  };

  // Disable the form if payment has been processed
  const isFormDisabled = !stripe || !elements || isLoading || isProcessed;

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full py-5">
      <PaymentElement
        id="payment-element"
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {errorMessage && <div className="text-sm text-red-600 my-2">{errorMessage}</div>}
      
      <Button
        type="submit"
        disabled={isFormDisabled}
        className="w-full mt-4"
      >
        {isLoading ? tForm('processing') : isProcessed ? t('status.success') : tForm('pay_button')}
      </Button>
    </form>
  );
}

export function StripeElementsWrapper({
  stripePublicKey,
  clientSecret,
  ...props
}: StripeElementsWrapperProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const t = useTranslations('payment.form');

  useEffect(() => {
    if (stripePublicKey) {
      setStripePromise(loadStripe(stripePublicKey));
    }
  }, [stripePublicKey]);

  if (!clientSecret || !stripePromise) {
    return <div className="text-center py-4">{t('loading')}</div>;
  }

  // Note: Express payment methods (Apple Pay, Google Pay) are automatically enabled
  // by Stripe if they are configured in the Stripe dashboard and the user's browser/device
  // supports them. There is no need to create custom buttons.
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm clientSecret={clientSecret} {...props} />
    </Elements>
  );
}

export default StripeElementsWrapper; 