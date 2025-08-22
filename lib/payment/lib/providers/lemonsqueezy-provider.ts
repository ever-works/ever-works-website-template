import { User } from '@supabase/auth-js';
import axios from 'axios';
import * as crypto from 'crypto';
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
  UpdateSubscriptionParams,
  SubscriptionInfo,
  SetupIntent,
  UIComponents,
  CheckoutParams,
} from '../../types/payment-types';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { env } from '@/lib/config/env';

export interface LemonSqueezyConfig extends PaymentProviderConfig {
  apiKey: string;
  webhookSecret: string;
  options?: {
    storeId?: string;
    testMode?: boolean;
  };
}

export class LemonSqueezyProvider implements PaymentProviderInterface {
  private apiKey: string;
  private webhookSecret: string;
  private storeId?: string;
  private testMode: boolean;
  private baseURL: string;

  constructor(config: LemonSqueezyConfig) {
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
    this.storeId = config.options?.storeId;
    this.testMode = config.options?.testMode || false;
    this.baseURL = 'https://api.lemonsqueezy.com/v1';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    };
  }

  hasCustomerId(user: User | null): boolean {
    return !!user?.user_metadata?.lemonsqueezy_customer_id;
  }

  async getCustomerId(user: User | null): Promise<string | null> {
    if (!user) return null;
    return user.user_metadata?.lemonsqueezy_customer_id || null;
  }

  async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
    try {
      const response = await axios.post(
        `${this.baseURL}/customers`,
        {
          data: {
            type: 'customers',
            attributes: {
              name: params.name,
              email: params.email,
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: this.storeId,
                },
              },
            },
          },
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.data.id,
        email: params.email,
        name: params.name,
        metadata: params.metadata,
      };
    } catch (error) {
      console.error('Error creating LemonSqueezy customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    try {
      const response = await axios.post(
        `${this.baseURL}/checkouts`,
        {
          data: {
            type: 'checkouts',
            attributes: {
              custom_price: params.amount,
              product_options: {
                name: 'Payment',
                description: 'Payment checkout',
                media: [],
              },
              checkout_options: {
                embed: false,
                media: false,
                logo: false,
              },
              checkout_data: {
                custom: params.metadata,
              },
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: this.storeId,
                },
              },
            },
          },
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.data.id,
        amount: params.amount,
        currency: params.currency,
        status: 'requires_payment_method',
        clientSecret: response.data.data.attributes.url,
        customerId: params.customerId,
      };
    } catch (error) {
      console.error('Error creating LemonSqueezy checkout:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentIntent> {
    // LemonSqueezy doesn't have a separate confirm step, return the payment intent
    return this.verifyPayment(paymentId).then(result => {
      if (result.isValid) {
        return {
          id: paymentId,
          amount: 0,
          currency: 'usd',
          status: result.status,
          clientSecret: '',
        };
      }
      throw new Error('Payment confirmation failed');
    });
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
    try {
      const response = await axios.get(
        `${this.baseURL}/orders/${paymentId}`,
        { headers: this.getHeaders() }
      );

      const order = response.data.data;
      return {
        isValid: true,
        paymentId: paymentId,
        status: order.attributes.status,
        details: order.attributes,
      };
    } catch (error) {
      console.error('Error verifying LemonSqueezy payment:', error);
      return {
        isValid: false,
        paymentId: paymentId,
        status: 'failed',
        details: error,
      };
    }
  }

  async createSetupIntent(): Promise<SetupIntent> {
    // LemonSqueezy doesn't use setup intents like Stripe
    // This is a placeholder implementation
    throw new Error('Setup intents not supported by LemonSqueezy');
  }

  async createCustomCheckout(params: CheckoutParams): Promise<string> {
    try {
      const { data, error } = await createCheckout(
        Number(this.storeId),
        params.variantId ?? Number(this.storeId), 
        {
          customPrice: params.customPrice, 
          productOptions: {
            redirectUrl: `${env.API_BASE_URL}/billing/success`,
          },
          checkoutOptions: { 
            embed: true,
            media: false,
            logo: false,
          },
          checkoutData: { 
            email: params.email,
            custom: params.metadata ?? {},
          },
          preview: false,
          testMode: process.env.NODE_ENV === 'development',
        }
      );

      if (error) {
        throw new Error(`Lemonsqueezy checkout error: ${error.message || 'Unknown error'}`);
      }

      if (!data?.data?.attributes?.url) {
        throw new Error('Invalid response from Lemonsqueezy: missing checkout URL');
      }

      return data.data.attributes.url;
    } catch (error) {
      console.error('Error creating LemonSqueezy subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionInfo> {
    try {
      const response = await axios.post(
        `${this.baseURL}/subscriptions`,
        {
          data: {
            type: 'subscriptions',
            attributes: {
              product_id: params.priceId,
              variant_id: params.priceId,
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: this.storeId,
                },
              },
              customer: {
                data: {
                  type: 'customers',
                  id: params.customerId,
                },
              },
            },
          },
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.data.id,
        customerId: params.customerId,
        status: response.data.data.attributes.status,
        priceId: params.priceId,
        paymentIntentId: response.data.data.id,
      };
    } catch (error) {
      console.error('Error creating LemonSqueezy subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<SubscriptionInfo> {
    try {
      const response = await axios.patch(
        `${this.baseURL}/subscriptions/${subscriptionId}`,
        {
          data: {
            type: 'subscriptions',
            id: subscriptionId,
            attributes: {
              cancelled: true,
            },
          },
        },
        { headers: this.getHeaders() }
      );

      return {
        id: subscriptionId,
        customerId: response.data.data.attributes.customer_id,
        status: response.data.data.attributes.status,
        priceId: response.data.data.attributes.product_id,
        cancelAtPeriodEnd,
      };
    } catch (error) {
      console.error('Error cancelling LemonSqueezy subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async updateSubscription(params: UpdateSubscriptionParams): Promise<SubscriptionInfo> {
    try {
      const response = await axios.patch(
        `${this.baseURL}/subscriptions/${params.subscriptionId}`,
        {
          data: {
            type: 'subscriptions',
            id: params.subscriptionId,
            attributes: {
              product_id: params.priceId,
              cancelled: params.cancelAtPeriodEnd,
            },
          },
        },
        { headers: this.getHeaders() }
      );

      return {
        id: params.subscriptionId,
        customerId: response.data.data.attributes.customer_id,
        status: response.data.data.attributes.status,
        priceId: params.priceId || response.data.data.attributes.product_id,
        cancelAtPeriodEnd: params.cancelAtPeriodEnd,
      };
    } catch (error) {
      console.error('Error updating LemonSqueezy subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    try {
      // LemonSqueezy uses HMAC-SHA256 for webhook verification
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(JSON.stringify(payload));
      const calculatedSignature = hmac.digest('hex');

      if (calculatedSignature !== signature) {
        return { 
          received: false, 
          type: 'verification_failed', 
          id: '', 
          data: { error: 'Invalid signature' } 
        };
      }

      const event = payload;
      return { 
        received: true, 
        type: event.meta.event_name, 
        id: event.data.id, 
        data: event.data 
      };
    } catch (error) {
      console.error('Error handling LemonSqueezy webhook:', error);
      return { 
        received: false, 
        type: 'processing_error', 
        id: '', 
        data: { error: 'Webhook processing failed' } 
      };
    }
  }

  async refundPayment(): Promise<any> {
    // LemonSqueezy doesn't have a direct refund API
    // Refunds are typically handled through the dashboard
    throw new Error('Refunds must be processed through LemonSqueezy dashboard');
  }

  getClientConfig(): ClientConfig {
    return {
      publicKey: this.apiKey,
      paymentGateway: 'lemonsqueezy',
      options: {
        storeId: this.storeId,
        testMode: this.testMode,
      },
    };
  }

  getUIComponents(): UIComponents {
    return {
      PaymentForm: () => null, // Placeholder component
      logo: '/logos/lemonsqueezy-logo.svg',
      cardBrands: [],
      supportedPaymentMethods: ['card', 'paypal'],
      translations: {
        en: {
          'button.pay': 'Pay with LemonSqueezy',
          'button.subscribe': 'Subscribe with LemonSqueezy',
        },
      },
    };
  }
}