import { NextRequest, NextResponse } from 'next/server';
import { auth, getOrCreateStripeProvider } from '@/lib/auth';
import Stripe from 'stripe';


// GET - Retrieve a specific payment method by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const stripeProvider = getOrCreateStripeProvider();
    const stripe = stripeProvider.getStripeInstance();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment method
    const paymentMethod = await stripe.paymentMethods.retrieve(id);

    // Verify that the payment method belongs to the current user's customer
    if (paymentMethod.customer) {
      const customer = await stripe.customers.retrieve(paymentMethod.customer as string);
      
      if (typeof customer === 'string' || customer.deleted) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }

      // Check if this customer belongs to the current user
      if (customer.metadata?.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - payment method does not belong to user' },
          { status: 403 }
        );
      }

      // Check if this is the default payment method
      const isDefault = customer.invoice_settings?.default_payment_method === id;

      // Format response with additional details
      const formattedPaymentMethod = {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          funding: paymentMethod.card.funding,
          country: paymentMethod.card.country,
          fingerprint: paymentMethod.card.fingerprint,
        } : null,
        billing_details: paymentMethod.billing_details,
        created: paymentMethod.created,
        metadata: paymentMethod.metadata,
        is_default: isDefault,
        customer_id: customer.id,
      };

      return NextResponse.json({
        success: true,
        data: formattedPaymentMethod,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment method not associated with any customer' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error retrieving payment method:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'resource_missing') {
        return NextResponse.json(
          { success: false, error: 'Payment method not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to retrieve payment method' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific payment method by ID (alternative endpoint)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const stripeProvider = getOrCreateStripeProvider();
    const stripe = stripeProvider.getStripeInstance();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Get the payment method to verify ownership
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    
    if (!paymentMethod.customer) {
      return NextResponse.json(
        { success: false, error: 'Payment method not associated with a customer' },
        { status: 400 }
      );
    }

    // Verify that the payment method belongs to the current user's customer
    const customer = await stripe.customers.retrieve(paymentMethod.customer as string);
    
    if (typeof customer === 'string' || customer.deleted) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if this customer belongs to the current user
    if (customer.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - payment method does not belong to user' },
        { status: 403 }
      );
    }

    // Check if this is the default payment method
    const isDefault = customer.invoice_settings?.default_payment_method === id;
    
    // If it's the default and there are other payment methods, set a new default
    if (isDefault) {
      const otherPaymentMethods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card',
      });
      
      const remainingMethods = otherPaymentMethods.data.filter(pm => pm.id !== id);
      
      if (remainingMethods.length > 0) {
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: remainingMethods[0].id,
          },
        });
      } else {
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: undefined,
          },
        });
      }
    }

    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(id);

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully',
      data: {
        was_default: isDefault,
      },
    });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'resource_missing') {
        return NextResponse.json(
          { success: false, error: 'Payment method not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
