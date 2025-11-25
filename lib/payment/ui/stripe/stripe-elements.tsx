'use client';

import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { PaymentFormProps } from '../../types/payment-types';
import { useSetupIntent } from '@/hooks/use-setup-intent';
import { Button } from '@/components/ui/button';

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

  const handleStripeError = (error: any, defaultMessage: string) => {
    let errorMessage = error.message || defaultMessage;
    
    const errorTranslations: { [key: string]: string } = {
      'Your card number is incomplete': 'Your card number is incomplete',
      'Your card\'s expiration date is incomplete': 'Your card\'s expiration date is incomplete',
      'Your card\'s security code is incomplete': 'Your card\'s security code is incomplete',
      'Your postal code is incomplete': 'Your postal code is incomplete',
      'Your card number is invalid': 'Your card number is invalid',
      'Your card\'s expiration date is invalid': 'Your card\'s expiration date is invalid',
      'Your card\'s security code is invalid': 'Your card\'s security code is invalid',
      'Your card was declined': 'Your card was declined',
      'Your card does not support this type of purchase': 'Your card does not support this type of purchase',
      'Your card has insufficient funds': 'Your card has insufficient funds',
      'Your card has expired': 'Your card has expired',
      'Your card was declined by the issuing bank': 'Your card was declined by the issuing bank',
      'Processing error': 'Processing error',
      'Invalid request': 'Invalid request'
    };
    
    // Chercher une traduction
    const translatedMessage = Object.keys(errorTranslations).find(key => 
      errorMessage.includes(key)
    );
    
    if (translatedMessage) {
      errorMessage = errorTranslations[translatedMessage];
    }
    
    setErrorMessage(errorMessage);
    
    // Ne pas remonter les erreurs de validation comme erreurs critiques
    const validationErrors = [
      'incomplete',
      'invalid',
      'declined',
      'insufficient',
      'expired',
      'Your card number',
      'expiration date',
      'security code',
      'postal code'
    ];
    
    const isValidationError = validationErrors.some(validationError => 
      errorMessage.toLowerCase().includes(validationError.toLowerCase())
    );
    
    if (!isValidationError) {
      onError(new Error(errorMessage));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessed || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const paymentElement = elements.getElement('payment');
    if (paymentElement) {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Please check your payment information');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isSubscription) {
        const { setupIntent: existingSetupIntent } = await stripe.retrieveSetupIntent(clientSecret);
        
        if (existingSetupIntent && existingSetupIntent.status === 'succeeded') {
          setIsProcessed(true);
          onSuccess(existingSetupIntent.payment_method as string);
          return;
        }

        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: successUrl,
          },
          redirect: 'if_required',
        });

        if (error) {
          handleStripeError(error, 'Failed to setup payment method');
          return;
        }

        if (setupIntent && setupIntent.status === 'succeeded') {
          setIsProcessed(true);
          onSuccess(setupIntent.payment_method as string);
        }
      } else {
        const { paymentIntent: existingPaymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        
        if (existingPaymentIntent && existingPaymentIntent.status === 'succeeded') {
          setIsProcessed(true);
          onSuccess(existingPaymentIntent.id);
          return;
        }

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
          handleStripeError(error, 'Payment failed');
          return;
        }

        if (paymentIntent) {
          switch (paymentIntent.status) {
            case 'succeeded':
              setIsProcessed(true);
              onSuccess(paymentIntent.id);
              break;
            case 'processing':
              setErrorMessage('Payment is being processed...');
              break;
            case 'requires_payment_method':
              setErrorMessage('Payment method required');
              break;
            default:
              setErrorMessage('Unexpected payment status');
              break;
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        handleStripeError(error, 'An unexpected error occurred');
      } else {
        setErrorMessage('An unexpected error occurred');
        onError(error instanceof Error ? error : new Error('An unexpected error occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = !stripe || !elements || isLoading || isProcessed;

  return (
    <div className="w-full">
      <div className="mb-6 p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
              Secure Payment
            </h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              Your information is protected by SSL encryption
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire de paiement */}
      <form id="payment-form" onSubmit={handleSubmit} className="w-full">
        <div className="space-y-6">
          {/* Payment Element container with enhanced styles */}
          <div className="relative">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 animate-pulse"></div>
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Information
                </h3>
              </div>
              
              <PaymentElement
                id="payment-element"
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
                }}
                className="mb-4"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-pink-600 rounded-lg blur opacity-20"></div>
              <div className="relative p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                      Payment Error
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success message */}
          {isProcessed && (
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-20"></div>
              <div className="relative p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Payment Successful!
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your subscription has been activated successfully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced payment button */}
          <div className="relative">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <Button
              type="submit"
              disabled={isFormDisabled}
              className={`
                relative w-full h-12 text-lg font-semibold transition-all duration-300 transform
                ${isFormDisabled 
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95'
                }
                ${isLoading ? 'animate-pulse' : ''}
                shadow-lg hover:shadow-xl
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : isProcessed ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Payment Successful</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Confirm Payment</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Informations de confiance */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>SSL Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StripeElementsWrapper({
  stripePublicKey,
  ...props
}: StripeElementsWrapperProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const { clientSecret, isReady } = useSetupIntent();


  useEffect(() => {
    if (stripePublicKey) {
      setStripePromise(loadStripe(stripePublicKey));
    }
  }, [stripePublicKey]);

  if (!isReady) {
    return (
      <div className="w-full py-8">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 animate-pulse"></div>
            <div className="relative p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preparing Payment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Loading secure Stripe interface...
                  </p>
                </div>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-theme-primary-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-theme-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-theme-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        colorWarning: '#f59e0b',
        colorSuccess: '#10b981',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSizeBase: '16px',
        fontWeightNormal: '400',
        fontWeightMedium: '500',
        fontWeightBold: '600',
        borderRadius: '8px',
        spacingUnit: '4px',
        gridRowSpacing: '16px',
        gridColumnSpacing: '12px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          transition: 'all 0.2s ease',
        },
        '.Tab': {
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        },
        '.Tab--selected': {
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          color: '#ffffff',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px',
        },
        '.Error': {
          color: '#ef4444',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
    }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm clientSecret={clientSecret} {...props} />
    </Elements>
  );
}

export default StripeElementsWrapper; 