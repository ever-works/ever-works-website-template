/**
 * Service for sending payment emails
 * Handles all emails related to payments and subscriptions
 */

import { EmailService } from '@/lib/mail';
import { createEmailConfig } from '@/lib/newsletter/config';
import { sendEmailSafely } from '@/lib/newsletter/utils';
import { getPaymentSuccessTemplate } from '@/lib/mail/templates/payment-success';
import { getPaymentFailedTemplate } from '@/lib/mail/templates/payment-failed';
import {
  getNewSubscriptionTemplate,
  getUpdatedSubscriptionTemplate,
  getCancelledSubscriptionTemplate
} from '@/lib/mail/templates/subscription-events';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentEmailData {
  customerName: string;
  customerEmail: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  planName?: string;
  billingPeriod?: string;
  nextBillingDate?: string;
  receiptUrl?: string;
  companyName?: string;
  companyUrl?: string;
  supportEmail?: string;
}

export interface PaymentFailedEmailData extends PaymentEmailData {
  errorMessage: string;
  retryUrl?: string;
  updatePaymentUrl?: string;
}

export interface SubscriptionEmailData {
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: string;
  currency: string;
  billingPeriod: string;
  nextBillingDate?: string;
  subscriptionId: string;
  companyName?: string;
  companyUrl?: string;
  supportEmail?: string;
  manageSubscriptionUrl?: string;
  features?: string[];
  // For updates
  previousPlan?: string;
  previousAmount?: string;
  // For cancellations
  cancellationDate?: string;
  cancellationReason?: string;
  reactivateUrl?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// PAYMENT EMAIL SERVICE
// ============================================================================

export class PaymentEmailService {
  private emailService: EmailService | null = null;
  private emailConfig: any = null;

  constructor() {
    this.initializeEmailService();
  }

  /**
   * Initialize email service
   */
  private async initializeEmailService() {
    try {
      this.emailConfig = await createEmailConfig();
      this.emailService = new EmailService(this.emailConfig);
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Ensure email service is initialized
   */
  private async ensureEmailService() {
    if (!this.emailService || !this.emailConfig) {
      await this.initializeEmailService();
    }
    
    if (!this.emailService) {
      throw new Error('Email service is not available');
    }
  }

  /**
   * Send payment success confirmation email
   */
  async sendPaymentSuccessEmail(data: PaymentEmailData): Promise<EmailResult> {
    try {
      await this.ensureEmailService();
      
      const template = getPaymentSuccessTemplate(data);
      
      const result = await sendEmailSafely(
        this.emailService!,
        this.emailConfig,
        template,
        data.customerEmail,
        'payment success'
      );

      if (result.success) {
        console.log(`✅ Payment success email sent to ${data.customerEmail},`,data);
        return { success: true };
      } else {
        console.error(`❌ Failed to send payment success email: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Payment success email error:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send payment failure notification email
   */
  async sendPaymentFailedEmail(data: PaymentFailedEmailData): Promise<EmailResult> {
    try {
      await this.ensureEmailService();
      
      const template = getPaymentFailedTemplate(data);
      
      const result = await sendEmailSafely(
        this.emailService!,
        this.emailConfig,
        template,
        data.customerEmail,
        'payment failed'
      );

      if (result.success) {
        console.log(`✅ Payment failed email sent to ${data.customerEmail}`);
        return { success: true };
      } else {
        console.error(`❌ Failed to send payment failed email: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Payment failed email error:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send welcome email for new subscription
   */
  async sendNewSubscriptionEmail(data: SubscriptionEmailData): Promise<EmailResult> {
    try {
      await this.ensureEmailService();
      
      const template = getNewSubscriptionTemplate(data);
      
      const result = await sendEmailSafely(
        this.emailService!,
        this.emailConfig,
        template,
        data.customerEmail,
        'new subscription'
      );

      if (result.success) {
        console.log(`✅ New subscription email sent to ${data.customerEmail}`);
        return { success: true };
      } else {
        console.error(`❌ Failed to send new subscription email: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ New subscription email error:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send subscription update email
   */
  async sendUpdatedSubscriptionEmail(data: SubscriptionEmailData): Promise<EmailResult> {
    try {
      await this.ensureEmailService();
      
      const template = getUpdatedSubscriptionTemplate(data);
      
      const result = await sendEmailSafely(
        this.emailService!,
        this.emailConfig,
        template,
        data.customerEmail,
        'subscription updated'
      );

      if (result.success) {
        console.log(`✅ Updated subscription email sent to ${data.customerEmail}`);
        return { success: true };
      } else {
        console.error(`❌ Failed to send updated subscription email: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Updated subscription email error:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send subscription cancellation email
   */
  async sendCancelledSubscriptionEmail(data: SubscriptionEmailData): Promise<EmailResult> {
    try {
      await this.ensureEmailService();
      
      const template = getCancelledSubscriptionTemplate(data);
      
      const result = await sendEmailSafely(
        this.emailService!,
        this.emailConfig,
        template,
        data.customerEmail,
        'subscription cancelled'
      );

      if (result.success) {
        console.log(`✅ Cancelled subscription email sent to ${data.customerEmail}`);
        return { success: true };
      } else {
        console.error(`❌ Failed to send cancelled subscription email: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Cancelled subscription email error:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send successful subscription payment email
   */
  async sendSubscriptionPaymentSuccessEmail(data: PaymentEmailData): Promise<EmailResult> {
    try {
      await this.ensureEmailService();
      
      // Use payment success template with subscription-specific data
      const template = getPaymentSuccessTemplate({
        ...data,
        companyName: data.companyName || "Ever Works",
        companyUrl: data.companyUrl || "https://ever.works",
        supportEmail: data.supportEmail || "support@ever.works"
      });
      
      const result = await sendEmailSafely(
        this.emailService!,
        this.emailConfig,
        template,
        data.customerEmail,
        'subscription payment success'
      );

      if (result.success) {
        console.log(`✅ Subscription payment success email sent to ${data.customerEmail}`);
        return { success: true };
      } else {
        console.error(`❌ Failed to send subscription payment success email: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Subscription payment success email error:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send failed subscription payment email
   */
  async sendSubscriptionPaymentFailedEmail(data: PaymentFailedEmailData): Promise<EmailResult> {
    try {
      await this.ensureEmailService();
      
      // Use payment failure template with subscription-specific data
      const template = getPaymentFailedTemplate({
        ...data,
        companyName: data.companyName || "Ever Works",
        companyUrl: data.companyUrl || "https://ever.works",
        supportEmail: data.supportEmail || "support@ever.works"
      });
      
      const result = await sendEmailSafely(
        this.emailService!,
        this.emailConfig,
        template,
        data.customerEmail,
        'subscription payment failed'
      );

      if (result.success) {
        console.log(`✅ Subscription payment failed email sent to ${data.customerEmail}`);
        return { success: true };
      } else {
        console.error(`❌ Failed to send subscription payment failed email: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Subscription payment failed email error:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract customer information from Stripe data
 */
export const extractCustomerInfo = (stripeObject: any) => {
  const customer = stripeObject.customer;
  const billing_details = stripeObject.billing_details;
  
  return {
    customerName: customer?.name || billing_details?.name || 'Customer',
    customerEmail: customer?.email || billing_details?.email || '',
  };
};

/**
 * Format amount from cents to currency
 */
export const formatAmount = (amountInCents: number, currency: string = 'USD') => {
  return (amountInCents / 100).toFixed(2) + " " + currency.toUpperCase();
};

/**
 * Format payment method information
 */
export const formatPaymentMethod = (paymentMethod: any) => {
  if (!paymentMethod) return 'Credit Card';
  
  const { type, card } = paymentMethod;
  
  if (type === 'card' && card) {
    return `**** **** **** ${card.last4} (${card.brand?.toUpperCase()})`;
  }
  
  return type || 'Credit Card';
};

/**
 * Format billing date from timestamp
 */
export const formatBillingDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get plan name from Price ID
 */
export const getPlanName = (priceId: string) => {
  // Mapping of Price IDs to plan names
  const planMapping: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID || '']: 'Standard Plan',
    [process.env.NEXT_PUBLIC_STRIPE_ONETIME_PRICE_ID || '']: 'Premium Plan',
    [process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID || '']: 'Free Plan',
  };
  
  return planMapping[priceId] || 'Premium Plan';
};

/**
 * Get billing period in English
 */
export const getBillingPeriod = (interval: string) => {
  const periods: Record<string, string> = {
    month: 'month',
    year: 'year',
    week: 'week',
    day: 'day'
  };
  
  return periods[interval] || 'month';
};

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Singleton instance of the service
export const paymentEmailService = new PaymentEmailService(); 