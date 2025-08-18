import { NextRequest, NextResponse } from 'next/server';
import { auth, getOrCreateStripeProvider } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, paymentMethodId, trialPeriodDays } = await request.json();

    // Get or create Stripe provider (singleton)
    const stripeProvider = getOrCreateStripeProvider();
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

    // Get or create Stripe provider (singleton)
    const stripeProvider = getOrCreateStripeProvider();
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

    // Get or create Stripe provider (singleton)
    const stripeProvider = getOrCreateStripeProvider();

    // Cancel subscription
    const subscription = await stripeProvider.cancelSubscription(subscriptionId, cancelAtPeriodEnd);

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
} 