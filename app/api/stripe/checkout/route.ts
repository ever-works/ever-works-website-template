import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { StripeProvider } from '@/lib/payment/lib/providers/stripe-provider';
import { createProviderConfigs } from '@/lib/payment/config/provider-configs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 });
    }

    const { 
      priceId, 
      mode = 'subscription', 
      trialPeriodDays = 0, 
      billingInterval = 'month',
      successUrl,
      cancelUrl,
      customerId,
      metadata = {}
    } = await request.json();

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

    // Get or create customer
    const stripeCustomerId = await stripeProvider.getCustomerId(session.user as any);
    
    if (!stripeCustomerId) {
      return NextResponse.json({
        error: 'Failed to create customer',
        message: 'Unable to create Stripe customer'
      }, { status: 400 });
    }

    const checkoutParams: any = {
      customer: stripeCustomerId,
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        userId: session.user.id,
        billingInterval,
      },
      ui_mode: 'hosted',
      custom_text: {
        submit: {
          message: 'Your subscription will be activated immediately after payment.',
        },
      },
    };

    // Add subscription-specific configuration
    if (mode === 'subscription') {
      checkoutParams.subscription_data = {
        metadata: {
          userId: session.user.id,
          planId: metadata.planId,
          planName: metadata.planName,
          billingInterval,
        },
      };

      // Add trial period if specified
      if (trialPeriodDays > 0) {
        checkoutParams.subscription_data.trial_period_days = trialPeriodDays;
      }

      // Configure billing address collection
      checkoutParams.billing_address_collection = 'auto';
      
      // Configure customer details
      checkoutParams.customer_update = {
        address: 'auto',
        name: 'auto',
      };

      // Allow promotion codes
      checkoutParams.allow_promotion_codes = true;
    }

    // Create checkout session via Stripe SDK
    const stripe = stripeProvider.getStripeInstance();
    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({
      data: {
        id: checkoutSession.id,
        url: checkoutSession.url,
      },
      status: 200,
      message: 'Checkout session created successfully'
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    
    return NextResponse.json({
      error: errorMessage,
      message: 'Failed to create checkout session',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

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
    const stripe = stripeProvider.getStripeInstance();

    // Retrieve checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription'],
    });

    return NextResponse.json({
      session: checkoutSession,
      status: checkoutSession.status,
      customer: checkoutSession.customer,
      subscription: checkoutSession.subscription,
    });
  } catch (error) {
    console.error('Checkout session retrieval error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve checkout session';
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
} 