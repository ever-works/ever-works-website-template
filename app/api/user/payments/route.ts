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
      return NextResponse.json([]);
    }

    try {
      // Fetch all invoices for this customer
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 100
      });

      // Fetch all subscriptions for additional context (reduced expansion levels)
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 100
      });

      // Create a map of subscription data for quick lookup
      const subscriptionMap = new Map();
      subscriptions.data.forEach(sub => {
        return subscriptionMap.set(sub.id, {
          planName: sub.metadata.planName || 'Premium Plan', // Default name since we can't expand product
          billingInterval: sub.items.data[0]?.price.recurring?.interval || 'monthly',
          status: sub.status
        });
      });

      // Transform Stripe invoice data to our payment format
      const paymentHistory = invoices.data
        .filter(invoice => invoice.status === 'paid' || invoice.status === 'open')
        .map(invoice => {
          console.log('invoice', invoice);
          // Get subscription ID from invoice lines if available
          const subscriptionId = invoice.lines?.data?.[0]?.subscription;
          const subscriptionData = subscriptionId ? subscriptionMap.get(subscriptionId) : null;
          
          return {
            id: invoice.id,
            date: new Date(invoice.created * 1000).toISOString(),
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            plan: subscriptionData?.planName,
            planId: '',
            status: invoice.status === 'paid' ? 'Paid' : 
                    invoice.status === 'open' ? 'Pending' : 
                    invoice.status === 'draft' ? 'Draft' : 'Unknown',
            billingInterval: subscriptionData?.billingInterval || 'monthly',
            paymentProvider: 'stripe',
            subscriptionId: subscriptionId || '',
            description: `${subscriptionData?.planName || 'Premium Plan'} - ${subscriptionData?.billingInterval || 'monthly'} billing`,
            invoiceUrl: invoice.hosted_invoice_url || null,
            invoiceNumber: invoice.number || null
          };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return NextResponse.json(paymentHistory);
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { error: 'Failed to fetch payment data from Stripe' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' }, 
      { status: 500 }
    );
  }
}
