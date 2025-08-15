import { NextResponse } from 'next/server';
import { auth, initializeStripeProvider } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Stripe provider
    const stripeProvider = initializeStripeProvider();
		const stripe = stripeProvider.getStripeInstance();

    // Get or create customer ID
    const customerId = await stripeProvider.getCustomerId(session.user as any);
    
    if (!customerId) {
      return NextResponse.json({ 
        hasActiveSubscription: false,
        message: 'No Stripe customer found' 
      });
    }

    try {
      // Fetch all subscriptions for this customer (reduced expansion levels)
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 100,
        expand: ['data.default_payment_method']
      });

      // Find active subscription
      const activeSubscription = subscriptions.data.find(sub => 
        sub.status === 'active' || sub.status === 'trialing'
      );

      console.log('activeSubscription', activeSubscription);

      // Transform Stripe data to our format
      const subscriptionData = {
        hasActiveSubscription: !!activeSubscription,
        currentSubscription: activeSubscription ? {
          id: activeSubscription.id,
          planId: activeSubscription.items.data[0]?.price.id || '',
          planName: activeSubscription.metadata.planName || 'Premium Plan',
          status: activeSubscription.status,
          startDate: new Date(activeSubscription.start_date * 1000).toISOString(),
          endDate: (activeSubscription as any).current_period_end ? new Date((activeSubscription as any).current_period_end * 1000).toISOString() : '',
          nextBillingDate: (activeSubscription as any).current_period_end ? new Date((activeSubscription as any).current_period_end * 1000).toISOString() : '',
          paymentProvider: 'stripe',
          subscriptionId: activeSubscription.id,
          amount: activeSubscription.items.data[0]?.price.unit_amount ? activeSubscription.items.data[0].price.unit_amount / 100 : 0,
          currency: activeSubscription.currency.toUpperCase(),
          billingInterval: activeSubscription.items.data[0]?.price.recurring?.interval || 'monthly'
        } : undefined,
        subscriptionHistory: subscriptions.data.map(sub => ({
          id: sub.id,
          planId: sub.items.data[0]?.price.id || '',
          planName: sub.metadata.planName ||  'Premium Plan', 
          status: sub.status,
          startDate: new Date(sub.start_date * 1000).toISOString(),
          endDate: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000).toISOString() : '',
          cancelledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : undefined,
          cancelReason: sub.cancellation_details?.reason || undefined,
          amount: sub.items.data[0]?.price.unit_amount ? sub.items.data[0].price.unit_amount / 100 : 0,
          currency: sub.currency.toUpperCase(),
          billingInterval: sub.items.data[0]?.price.recurring?.interval || 'monthly'
        }))
      };

      return NextResponse.json(subscriptionData);
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription data from Stripe' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' }, 
      { status: 500 }
    );
  }
}
