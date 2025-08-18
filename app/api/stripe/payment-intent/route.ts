import { NextRequest, NextResponse } from 'next/server';
import { auth, getOrCreateStripeProvider } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'usd', metadata, planId } = await request.json();

    // Get or create Stripe provider (singleton)
    const stripeProvider = getOrCreateStripeProvider();
    // Get or create customer
    const customerId = await stripeProvider.getCustomerId(session.user as any);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 400 });
    }

    // Create payment intent
    const paymentIntent = await stripeProvider.createPaymentIntent({
      amount,
      currency,
      customerId,
      metadata: {
        userId: session.user.id,
        planId,
        ...metadata
      }
    });

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 });
    }

    // Get or create Stripe provider (singleton)
    const stripeProvider = getOrCreateStripeProvider();

    // Verify payment
    const verification = await stripeProvider.verifyPayment(paymentIntentId);

    return NextResponse.json(verification);
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
} 