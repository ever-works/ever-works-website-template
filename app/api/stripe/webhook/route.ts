import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeProvider } from '@/lib/payment/lib/providers/stripe-provider';
import { createProviderConfigs } from '@/lib/payment/config/provider-configs';
import { WebhookEventType } from '@/lib/payment/types/payment-types';

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
  // TODO: Update user's payment status, send confirmation email, etc.
}

async function handlePaymentFailed(data: any) {
  console.log('Payment failed:', data.id);
  // TODO: Send failure notification, update user status, etc.
}

async function handleSubscriptionCreated(data: any) {
  console.log('Subscription created:', data.id);
  // TODO: Update user's subscription status, send welcome email, etc.
}

async function handleSubscriptionUpdated(data: any) {
  console.log('Subscription updated:', data.id);
  // TODO: Update subscription details in database
}

async function handleSubscriptionCancelled(data: any) {
  console.log('Subscription cancelled:', data.id);
  // TODO: Send cancellation email, update user access, etc.
}

async function handleSubscriptionPaymentSucceeded(data: any) {
  console.log('Subscription payment succeeded:', data.id);
  // TODO: Send receipt, extend subscription period, etc.
}

async function handleSubscriptionPaymentFailed(data: any) {
  console.log('Subscription payment failed:', data.id);
  // TODO: Send payment failure notification, update user status, etc.
}

async function handleSubscriptionTrialEnding(data: any) {
  console.log('Subscription trial ending:', data.id);
  // TODO: Send trial ending notification, prompt for payment method, etc.
} 