import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeProvider } from '@/lib/payment/lib/providers/stripe-provider';
import { createProviderConfigs } from '@/lib/payment/config/provider-configs';
import { WebhookEventType } from '@/lib/payment/types/payment-types';
import {
  paymentEmailService,
  extractCustomerInfo,
  formatAmount,
  formatPaymentMethod,
  formatBillingDate,
  getPlanName,
  getBillingPeriod
} from '@/lib/payment/services/payment-email.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Initialize Stripe provider
    const configs = createProviderConfigs({
      apiKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      options: {
        apiVersion: '2023-10-16'
      }
    });

    const stripeProvider = new StripeProvider(configs.stripe);
    const webhookResult = await stripeProvider.handleWebhook(body, signature);

    if (!webhookResult.received) {
      return NextResponse.json({ error: 'Webhook not processed' }, { status: 400 });
    }

    // Handle different webhook events
    switch (webhookResult.type) {
      case WebhookEventType.PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(webhookResult.data);
        break;
      case WebhookEventType.PAYMENT_FAILED:
        await handlePaymentFailed(webhookResult.data);
        break;
      case WebhookEventType.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(webhookResult.data);
        break;
      case WebhookEventType.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(webhookResult.data);
        break;
      case WebhookEventType.SUBSCRIPTION_CANCELLED:
        await handleSubscriptionCancelled(webhookResult.data);
        break;
      case WebhookEventType.SUBSCRIPTION_PAYMENT_SUCCEEDED:
        await handleSubscriptionPaymentSucceeded(webhookResult.data);
        break;
      case WebhookEventType.SUBSCRIPTION_PAYMENT_FAILED:
        await handleSubscriptionPaymentFailed(webhookResult.data);
        break;
      case WebhookEventType.SUBSCRIPTION_TRIAL_ENDING:
        await handleSubscriptionTrialEnding(webhookResult.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${webhookResult.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

async function handlePaymentSucceeded(data: any) {
  console.log('Payment succeeded:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract payment information
    const amount = formatAmount(data.amount, data.currency);
    const paymentMethod = formatPaymentMethod(data.payment_method);
   
    // Prepare email data
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail ||'gentilakili98@gmail.com',
      amount: amount,
      currency: data.currency,
      paymentMethod: paymentMethod,
      transactionId: data.id,
      receiptUrl: data.receipt_url,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works"
    };
    
    // Send confirmation email
    const emailResult = await paymentEmailService.sendPaymentSuccessEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Payment success email sent successfully');
    } else {
      console.error('❌ Failed to send payment success email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(data: any) {
  console.log('Payment failed:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract payment information
    const amount = formatAmount(data.amount, data.currency);
    const paymentMethod = formatPaymentMethod(data.payment_method);
    
    // Prepare email data
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail ||'gentilakili98@gmail.com',
      amount: amount,
      currency: data.currency,
      paymentMethod: paymentMethod,
      transactionId: data.id,
      errorMessage: data.last_payment_error?.message || 'Payment declined',
      retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/retry?payment_intent=${data.id}`,
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payment-methods`,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works"
    };
    
    // Send failure email
    const emailResult = await paymentEmailService.sendPaymentFailedEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Payment failed email sent successfully');
    } else {
      console.error('❌ Failed to send payment failed email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
}

async function handleSubscriptionCreated(data: any) {
  console.log('Subscription created:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract subscription information
    const priceId = data.items?.data?.[0]?.price?.id;
    const planName = getPlanName(priceId);
    const amount = formatAmount(data.items?.data?.[0]?.price?.unit_amount || 0, data.currency);
    const billingPeriod = getBillingPeriod(data.items?.data?.[0]?.price?.recurring?.interval);
    
    // Prepare email data
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail||'gentilakili98@gmail.com',
      planName: planName,
      amount: amount,
      currency: data.currency,
      billingPeriod: billingPeriod,
      nextBillingDate: data.current_period_end ? formatBillingDate(data.current_period_end) : undefined,
      subscriptionId: data.id,
      manageSubscriptionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works",
      features: getSubscriptionFeatures(planName)
    };
    
    // Send welcome email
    const emailResult = await paymentEmailService.sendNewSubscriptionEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ New subscription email sent successfully');
    } else {
      console.error('❌ Failed to send new subscription email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(data: any) {
  console.log('Subscription updated:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract subscription information
    const priceId = data.items?.data?.[0]?.price?.id;
    const planName = getPlanName(priceId);
    const amount = formatAmount(data.items?.data?.[0]?.price?.unit_amount || 0, data.currency);
    const billingPeriod = getBillingPeriod(data.items?.data?.[0]?.price?.recurring?.interval);
    
    // Prepare email data
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail ||'gentilakili98@gmail.com',
      planName: planName,
      amount: amount,
      currency: data.currency,
      billingPeriod: billingPeriod,
      nextBillingDate: data.current_period_end ? formatBillingDate(data.current_period_end) : undefined,
      subscriptionId: data.id,
      manageSubscriptionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works",
      features: getSubscriptionFeatures(planName)
    };
    
    // Send update email
    const emailResult = await paymentEmailService.sendUpdatedSubscriptionEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Updated subscription email sent successfully');
    } else {
      console.error('❌ Failed to send updated subscription email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling subscription updated:', error);
  }
}

async function handleSubscriptionCancelled(data: any) {
  console.log('Subscription cancelled:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract subscription information
    const priceId = data.items?.data?.[0]?.price?.id;
    const planName = getPlanName(priceId);
    const amount = formatAmount(data.items?.data?.[0]?.price?.unit_amount || 0, data.currency);
    const billingPeriod = getBillingPeriod(data.items?.data?.[0]?.price?.recurring?.interval);
    
    // Prepare email data
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail ||'gentilakili98@gmail.com',
      planName: planName,
      amount: amount,
      currency: data.currency,
      billingPeriod: billingPeriod,
      subscriptionId: data.id,
      cancellationDate: data.canceled_at ? formatBillingDate(data.canceled_at) : undefined,
      cancellationReason: data.cancellation_details?.reason || 'Cancellation requested by user',
      reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/reactivate?subscription=${data.id}`,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works"
    };
    
    // Send cancellation email
    const emailResult = await paymentEmailService.sendCancelledSubscriptionEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Cancelled subscription email sent successfully');
    } else {
      console.error('❌ Failed to send cancelled subscription email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling subscription cancelled:', error);
  }
}

async function handleSubscriptionPaymentSucceeded(data: any) {
  console.log('Subscription payment succeeded:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract payment information
    const amount = formatAmount(data.amount_paid, data.currency);
    const subscription = data.subscription;
    const planName = subscription ? getPlanName(subscription.items?.data?.[0]?.price?.id) : 'Premium Plan';
    const billingPeriod = subscription ? getBillingPeriod(subscription.items?.data?.[0]?.price?.recurring?.interval) : 'month';
    
    // Prepare email data
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail ||'gentilakili98@gmail.com',
      amount: amount,
      currency: data.currency,
      paymentMethod: 'Credit Card',
      transactionId: data.id,
      planName: planName,
      billingPeriod: billingPeriod,
      nextBillingDate: subscription?.current_period_end ? formatBillingDate(subscription.current_period_end) : undefined,
      receiptUrl: data.receipt_url,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works"
    };
    
    // Send confirmation email
    const emailResult = await paymentEmailService.sendSubscriptionPaymentSuccessEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Subscription payment success email sent successfully');
    } else {
      console.error('❌ Failed to send subscription payment success email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling subscription payment succeeded:', error);
  }
}

async function handleSubscriptionPaymentFailed(data: any) {
  console.log('Subscription payment failed:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract payment information
    const amount = formatAmount(data.amount_due, data.currency);
    const subscription = data.subscription;
    const planName = subscription ? getPlanName(subscription.items?.data?.[0]?.price?.id) : 'Premium Plan';
    const billingPeriod = subscription ? getBillingPeriod(subscription.items?.data?.[0]?.price?.recurring?.interval) : 'month';
    
    // Prepare email data
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail ||'gentilakili98@gmail.com',
      amount: amount,
      currency: data.currency,
      paymentMethod: 'Credit Card',
      transactionId: data.id,
      planName: planName,
      billingPeriod: billingPeriod,
      errorMessage: data.last_payment_error?.message || 'Payment declined',
      retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/retry?invoice=${data.id}`,
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payment-methods`,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works"
    };
    
    // Send failure email
    const emailResult = await paymentEmailService.sendSubscriptionPaymentFailedEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Subscription payment failed email sent successfully');
    } else {
      console.error('❌ Failed to send subscription payment failed email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling subscription payment failed:', error);
  }
}

async function handleSubscriptionTrialEnding(data: any) {
  console.log('Subscription trial ending:', data.id);
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(data);
    
    // Extract subscription information
    const priceId = data.items?.data?.[0]?.price?.id;
    const planName = getPlanName(priceId);
    const amount = formatAmount(data.items?.data?.[0]?.price?.unit_amount || 0, data.currency);
    const billingPeriod = getBillingPeriod(data.items?.data?.[0]?.price?.recurring?.interval);
    
    // Prepare email data (uses updated subscription template)
    const emailData = {
      customerName: customerInfo.customerName,
      customerEmail: customerInfo.customerEmail ||'gentilakili98@gmail.com',
      planName: planName,
      amount: amount,
      currency: data.currency,
      billingPeriod: billingPeriod,
      nextBillingDate: data.current_period_end ? formatBillingDate(data.current_period_end) : undefined,
      subscriptionId: data.id,
      manageSubscriptionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
      companyName: "Ever Works",
      companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
      supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works"
    };
    
    // Send trial ending notification email
    const emailResult = await paymentEmailService.sendUpdatedSubscriptionEmail(emailData);
    
    if (emailResult.success) {
      console.log('✅ Trial ending email sent successfully');
    } else {
      console.error('❌ Failed to send trial ending email:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Error handling subscription trial ending:', error);
  }
}

/**
 * Get subscription features for a plan
 */
function getSubscriptionFeatures(planName: string): string[] {
  const features: Record<string, string[]> = {
    'Free Plan': [
      'Access to basic features',
      'Email support',
      'Limited storage'
    ],
    'Pro Plan': [
      'All advanced features',
      'Priority support',
      'Unlimited storage',
      'Third-party integrations',
      'Advanced analytics'
    ],
    'Sponsor Plan': [
      'All Pro features',
      'Dedicated support',
      'Custom features',
      'Full API integration',
      'Custom training'
    ]
  };
  
  return features[planName] || features['Pro Plan'];
} 