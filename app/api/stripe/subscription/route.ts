import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { StripeProvider } from '@/lib/payment/lib/providers/stripe-provider';
import { createProviderConfigs } from '@/lib/payment/config/provider-configs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, paymentMethodId, trialPeriodDays } = await request.json();

    // Initialize Stripe provider
    function initializeStripeProvider() { 
      const requiredEnvVars = {
        apiKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        options: {
          apiVersion: "2023-10-16",
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        }

      };
      if (!requiredEnvVars.apiKey || !requiredEnvVars.webhookSecret || !requiredEnvVars.options.publishableKey) {
        throw new Error('Stripe configuration is incomplete');
      }
    
    const configs = createProviderConfigs({
      apiKey: requiredEnvVars.apiKey,
      webhookSecret: requiredEnvVars.webhookSecret,
      options: requiredEnvVars.options
    });

    return new StripeProvider(configs.stripe);
  }
    const stripeProvider = initializeStripeProvider();

    // Get or create customer
    const customerId = await stripeProvider.getCustomerId(session.user as any);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 400 });
    }

    // Create subscription
    const subscription = await stripeProvider.createSubscription({
      customerId,
      priceId,
      paymentMethodId,
      trialPeriodDays,
      metadata: {
        userId: session.user.id
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, priceId, cancelAtPeriodEnd } = await request.json();

    // Initialize Stripe provider
    const configs = createProviderConfigs({
      apiKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      options: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        apiVersion: '2023-10-16'
      }
    });

    const stripeProvider = new StripeProvider(configs.stripe);

    // Update subscription
    const subscription = await stripeProvider.updateSubscription({
      subscriptionId,
      priceId,
      cancelAtPeriodEnd,
      metadata: {
        userId: session.user.id
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, cancelAtPeriodEnd } = await request.json();

    // Initialize Stripe provider
    const configs = createProviderConfigs({
      apiKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      options: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        apiVersion: '2023-10-16'
      }
    });

    const stripeProvider = new StripeProvider(configs.stripe);

    // Cancel subscription
    const subscription = await stripeProvider.cancelSubscription(subscriptionId, cancelAtPeriodEnd);

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
} 