import { NextRequest, NextResponse } from 'next/server';
import { auth, getOrCreateStripeProvider } from '@/lib/auth';
import Stripe from 'stripe';
import { z } from 'zod';
import {
  getUserStripeCustomerId,
  saveUserStripeCustomerId
} from '@/lib/stripe-helpers';


// Validation schema for creating payment method
const createPaymentMethodSchema = z.object({
  setup_intent_id: z.string().min(1, 'Setup intent ID is required'),
  set_as_default: z.boolean().default(false),
  metadata: z.record(z.string(), z.string()).optional(),
});

// POST - Create/Attach a payment method from setup intent
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { setup_intent_id, set_as_default, metadata } = createPaymentMethodSchema.parse(body);
    const stripeProvider = getOrCreateStripeProvider();
		const stripe = stripeProvider.getStripeInstance();
    const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);

    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Setup intent has not succeeded' },
        { status: 400 }
      );
    }

    if (!setupIntent.payment_method) {
      return NextResponse.json(
        { success: false, error: 'No payment method found in setup intent' },
        { status: 400 }
      );
    }

    const paymentMethodId = typeof setupIntent.payment_method === 'string' 
      ? setupIntent.payment_method 
      : setupIntent.payment_method.id;

    // Get or create Stripe customer
    let stripeCustomerId = await getUserStripeCustomerId(session.user.id, stripe);
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      
      stripeCustomerId = customer.id;
      await saveUserStripeCustomerId(session.user.id, stripeCustomerId);
    }

    // Attach the payment method to the customer if not already attached
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    if (!paymentMethod.customer) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });
    }

    // Update metadata if provided
    if (metadata) {
      await stripe.paymentMethods.update(paymentMethodId, {
        metadata: {
          userId: session.user.id,
          ...metadata,
        },
      });
    }

    // Set as default payment method if requested
    if (set_as_default) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Retrieve the updated payment method with full details
    const updatedPaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Format response
    const formattedPaymentMethod = {
      id: updatedPaymentMethod.id,
      type: updatedPaymentMethod.type,
      card: updatedPaymentMethod.card ? {
        brand: updatedPaymentMethod.card.brand,
        last4: updatedPaymentMethod.card.last4,
        exp_month: updatedPaymentMethod.card.exp_month,
        exp_year: updatedPaymentMethod.card.exp_year,
        funding: updatedPaymentMethod.card.funding,
      } : null,
      created: updatedPaymentMethod.created,
      metadata: updatedPaymentMethod.metadata,
    };

    return NextResponse.json({
      success: true,
      data: formattedPaymentMethod,
      message: 'Payment method created successfully',
    });

  } catch (error) {
    console.error('Error creating payment method:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error},
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}


