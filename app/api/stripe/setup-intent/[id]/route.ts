import { auth, getOrCreateStripeProvider } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


// GET - Retrieve a setup intent by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { id } =await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Setup intent ID is required' },
        { status: 400 }
      );
    }

    const stripeProvider = getOrCreateStripeProvider();
		const stripe = stripeProvider.getStripeInstance();

    // Retrieve the setup intent
    const setupIntent = await stripe.setupIntents.retrieve(id);

    // Verify that the setup intent belongs to the current user's customer
    if (setupIntent.customer) {
      const customer = await stripe.customers.retrieve(setupIntent.customer as string);
      
      if (typeof customer === 'string' || customer.deleted) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }

      // Check if this customer belongs to the current user
      if (customer.metadata?.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - setup intent does not belong to user' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: setupIntent.id,
        client_secret: setupIntent.client_secret,
        status: setupIntent.status,
        usage: setupIntent.usage,
        customer: setupIntent.customer,
        payment_method: setupIntent.payment_method,
        created: setupIntent.created,
        metadata: setupIntent.metadata,
      },
    });

  } catch (error) {
    console.error('Error retrieving setup intent:', error);
    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'resource_missing') {
        return NextResponse.json(
          { success: false, error: 'Setup intent not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to retrieve setup intent' },
      { status: 500 }
    );
  }
}
