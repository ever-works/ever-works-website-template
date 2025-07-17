import Stripe from 'stripe';
import React from 'react';
import { User } from '@supabase/auth-js';
import axios from 'axios';
import {
  PaymentProviderInterface,
  PaymentIntent,
  PaymentVerificationResult,
  WebhookResult,
  CreatePaymentParams,
  ClientConfig,
  PaymentProviderConfig,
  CreateCustomerParams,
  CustomerResult,
  CreateSubscriptionParams,
  SubscriptionInfo,
  SubscriptionStatus,
  UpdateSubscriptionParams,
  UIComponents,
  CardBrandIcon,
  PaymentFormProps,
  SetupIntent
} from '../../types/payment-types';
import StripeElementsWrapper from '../../ui/stripe/stripe-elements';
import { PRICES } from '../utils/prices';

// Import dynamically in actual implementation
// For this file, we'll define placeholders
const stripeCardBrands: CardBrandIcon[] = [
  {
    name: 'visa',
    lightIcon: '/assets/payment/stripe/visa-light.svg',
    darkIcon: '/assets/payment/stripe/visa-dark.svg',
    width: 40,
    height: 25
  },
  {
    name: 'mastercard',
    lightIcon: '/assets/payment/stripe/mastercard-light.svg',
    darkIcon: '/assets/payment/stripe/mastercard-dark.svg',
    width: 40,
    height: 25
  },
  {
    name: 'amex',
    lightIcon: '/assets/payment/stripe/amex-light.svg',
    darkIcon: '/assets/payment/stripe/amex-dark.svg',
    width: 40,
    height: 25
  },
  {
    name: 'discover',
    lightIcon: '/assets/payment/stripe/discover-light.svg',
    darkIcon: '/assets/payment/stripe/discover-dark.svg',
    width: 40,
    height: 25
  }
];

// Mock translations - would be actual translations in real implementation
const stripeTranslations = {
  en: {
    cardNumber: 'Card number',
    cardExpiry: 'Expiration date',
    cardCvc: 'CVC',
    submit: 'Pay now',
    processingPayment: 'Processing payment...',
    paymentSuccessful: 'Payment successful',
    paymentFailed: 'Payment failed',
  },
  fr: {
    cardNumber: 'Card number',
    cardExpiry: 'Expiration date',
    cardCvc: 'CVC',
    submit: 'Pay now',
    processingPayment: 'Processing payment...',
    paymentSuccessful: 'Payment successful',
    paymentFailed: 'Payment failed',
  }
};

export class StripeProvider implements PaymentProviderInterface {
  private stripe: Stripe;
  private webhookSecret: string;
  private publishableKey: string;

  constructor(config: PaymentProviderConfig) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
    });
    this.webhookSecret = config.webhookSecret!;
    this.publishableKey = config.options?.publishableKey || '';
  }

  hasCustomerId(user: User | null): boolean {
    return !!user?.user_metadata.stripe_customer_id;
  }

  // Private method to update user metadata via the API
  private async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<boolean> {
    try {
      // Appel à la route d'API
      const response = await axios.post('/api/user/update-metadata',
        { userId, metadata },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error updating user metadata via API:', error);
      return false;
    }
  }

  async getCustomerId(user: User | null): Promise<string | null> {
    if (this.hasCustomerId(user)) {
      return user?.user_metadata?.stripe_customer_id || null;
    } else {
      const customer = await this.createCustomer({
        email: user?.email || '',
        name: user?.user_metadata.name,
        metadata: { userId: user?.id },
      });
 
      console.log('user==+++====>', user);
      if (user) {
        try {
          // Update the metadata via the API
          // await this.updateUserMetadata(user.id, {
          //   stripe_customer_id: customer.id
          // });
          console.log('customer', customer);
        } catch (error: any) {
          console.error('Failed to update stripe_customer_id:', error.message);
        }
      }

      return customer.id;
    }
  }

  async createSetupIntent(user: User | null): Promise<SetupIntent> {
    const setupIntent = await this.stripe.setupIntents.create({
      customer: user?.user_metadata.stripe_customer_id,
      payment_method_types: [ 'card' ],
    });

    return { ...setupIntent, clientSecret: setupIntent.client_secret! };
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    try {
      const { amount, currency, metadata, customerId, productId } = params;

      const stripeParams: Stripe.PaymentIntentCreateParams = {
        amount: metadata?.planId === "1" ? Math.round((PRICES.us?.free?.amount || amount) * 100) 
        :metadata?.planId === "2" ?  Math.round((PRICES.us?.oneTime?.amount || amount) * 100) 
         : Math.round((PRICES.us?.subscription?.amount || amount) * 100), 
         // Stripe expects amount in cents
        currency: PRICES.us?.currency || currency,
        setup_future_usage: 'off_session',
        automatic_payment_methods: { enabled: true },
        metadata
      };

      // Add the productId to the metadata if it is defined
      if (productId) {
        stripeParams.metadata!.productId = productId;
      }

      // Add the customerId only if it is defined
      if (customerId) {
        stripeParams.customer = customerId;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(stripeParams);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to decimal
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret || '',
        customerId: paymentIntent.customer as string || undefined
      };
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      throw error;
    }
  }

  async confirmPayment(paymentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentId, {
        payment_method: paymentMethodId,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret || '',
        customerId: paymentIntent.customer as string || undefined
      };
    } catch (error) {
      console.error('Stripe confirmPayment error:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

      return {
        isValid: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        status: paymentIntent.status,
        details: {
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata,
          customerId: paymentIntent.customer
        },
      };
    } catch (error) {
      console.error('Stripe verifyPayment error:', error);
      throw error;
    }
  }

  async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
    try {
      const { email, name, metadata } = params;

      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      });

      return {
        id: customer.id,
        email: customer.email || email,
        name: customer.name || undefined,
        metadata: customer.metadata
      };
    } catch (error) {
      console.error('Stripe createCustomer error:', error);
      throw error;
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionInfo> {
    try {
      const { customerId, paymentMethodId, priceId, trialPeriodDays, metadata } = params;


      const subscription_price_id = process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID;

      // If a paymentMethodId is provided, we need to first attach it to the client
      if (paymentMethodId) {
        await this.stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });

        // Set this payment method as the default payment method
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Create the subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        description: "Annual subscription created",
        items: [ { price: priceId } ],
        default_payment_method: paymentMethodId,
        expand: [ 'latest_invoice' ],
        metadata,
        collection_method: 'charge_automatically'
      };

      // For subscriptions without trial period
      if (trialPeriodDays === 0) {
        // Options to charge immediately
        subscriptionParams.off_session = true;
        subscriptionParams.payment_settings = {
          save_default_payment_method: 'on_subscription'
        };
      } else {
        subscriptionParams.trial_period_days = trialPeriodDays;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);

      // Get the payment_intent_id if available
      let paymentIntentId: string | undefined;
      if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string') {
        // Use a type assertion with additional check
        const invoice = subscription.latest_invoice as any;
        if (invoice && invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
          paymentIntentId = invoice.payment_intent.id;
        }
      }

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: this.mapSubscriptionStatus(subscription.status),
        currentPeriodEnd: subscription.items.data[ 0 ]?.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at || null,
        trialEnd: subscription.trial_end || null,
        priceId: subscription.items.data[ 0 ]?.price?.id || subscription_price_id!,
        paymentIntentId
      };
    } catch (error) {
      console.error('Stripe createSubscription error:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<SubscriptionInfo> {
    try {
      let subscription: Stripe.Subscription;

      if (cancelAtPeriodEnd) {
        // Cancel at the end of the current period
        subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        // Cancel immediately
        subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      }

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: this.mapSubscriptionStatus(subscription.status),
        currentPeriodEnd: subscription.items.data[ 0 ]?.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at || null,
        trialEnd: subscription.trial_end || null,
        priceId: subscription.items.data[ 0 ]?.price?.id || ''
      };
    } catch (error) {
      console.error('Stripe cancelSubscription error:', error);
      throw error;
    }
  }

  async updateSubscription(params: UpdateSubscriptionParams): Promise<SubscriptionInfo> {
    try {
      const { subscriptionId, priceId, cancelAtPeriodEnd, cancelAt, metadata } = params;

      const updateParams: Stripe.SubscriptionUpdateParams = {};

      if (priceId) {
        const existingSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        if (existingSubscription.items.data[ 0 ]) {
          updateParams.items = [
            {
              id: existingSubscription.items.data[ 0 ].id,
              price: priceId,
            },
          ];
        }
      }

      if (cancelAtPeriodEnd !== undefined) {
        updateParams.cancel_at_period_end = cancelAtPeriodEnd;
      }

      if (cancelAt !== undefined) {
        updateParams.cancel_at = cancelAt;
      }

      if (metadata) {
        updateParams.metadata = metadata;
      }

      const subscription = await this.stripe.subscriptions.update(subscriptionId, updateParams);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: this.mapSubscriptionStatus(subscription.status),
        currentPeriodEnd: subscription.items.data[ 0 ]?.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at || null,
        trialEnd: subscription.trial_end || null,
        priceId: subscription.items.data[ 0 ]?.price?.id || ''
      };
    } catch (error) {
      console.error('Stripe updateSubscription error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      let eventType: string;
      let eventData: any = {};

      // Map Stripe event types to generic types
      switch (event.type) {
        case 'payment_intent.succeeded':
          eventType = 'payment_succeeded';
          eventData = event.data.object;
          break;
        case 'payment_intent.payment_failed':
          eventType = 'payment_failed';
          eventData = event.data.object;
          break;
        case 'customer.subscription.created':
          eventType = 'subscription_created';
          eventData = event.data.object;
          break;
        case 'customer.subscription.updated':
          eventType = 'subscription_updated';
          eventData = event.data.object;
          break;
        case 'customer.subscription.deleted':
          eventType = 'subscription_cancelled';
          eventData = event.data.object;
          break;
        case 'customer.subscription.trial_will_end':
          eventType = 'subscription_trial_ending';
          eventData = event.data.object;
          break;
        case 'invoice.payment_succeeded':
          eventType = 'subscription_payment_succeeded';
          eventData = event.data.object;
          break;
        case 'invoice.payment_failed':
          eventType = 'subscription_payment_failed';
          eventData = event.data.object;
          break;
        default:
          eventType = event.type;
          eventData = event.data.object;
      }

      return {
        received: true,
        type: eventType,
        id: event.id,
        data: eventData
      };
    } catch (error) {
      console.error('Stripe webhook handling error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentId,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      };
    } catch (error) {
      console.error('Stripe refundPayment error:', error);
      throw error;
    }
  }

  getClientConfig(): ClientConfig {
    return {
      publicKey: this.publishableKey,
      paymentGateway: 'stripe',
    };
  }

  getUIComponents(): UIComponents {

    // Create a function that will inject the public key into the StripeElements component
    const StripePaymentFormWithConfig = (props: PaymentFormProps) => {
      return React.createElement(StripeElementsWrapper, {
        ...props,
        stripePublicKey: this.publishableKey
      });
    };

    return {
      // We use our wrapper function to configure the component with the public key
      PaymentForm: StripePaymentFormWithConfig,

      // Visual elements
      logo: '/assets/payment/stripe/stripe-logo.svg',
      cardBrands: stripeCardBrands,

      // Supported payment methods - Stripe automatically handles Apple Pay and Google Pay buttons
      // if they are enabled in the Stripe dashboard and the browser supports them
      supportedPaymentMethods: [ 'card' ],

      // Translations
      translations: stripeTranslations
    };
  }

  // Utility function to map Stripe subscription statuses to our own statuses
  private mapSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'incomplete':
        return SubscriptionStatus.INCOMPLETE;
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      default:
        return SubscriptionStatus.INCOMPLETE;
    }
  }
}
