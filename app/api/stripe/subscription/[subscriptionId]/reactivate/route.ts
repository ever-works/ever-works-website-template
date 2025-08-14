import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { StripeProvider } from '@/lib/payment/lib/providers/stripe-provider';
import { createProviderConfigs } from '@/lib/payment/config/provider-configs';
import { getSubscriptionByProviderSubscriptionId, updateSubscriptionBySubscriptionId } from '@/lib/db/queries';
import { paymentEmailService } from '@/lib/payment/services/payment-email.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await params;

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

    // Verify the subscription belongs to the user
    const userSubscription = await getSubscriptionByProviderSubscriptionId('stripe',subscriptionId);
    

    if (!userSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found or access denied' },
        { status: 404 }
      );
    }

    const subscription = userSubscription;

    // Check if subscription is actually cancelled
    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Reactivate the subscription in Stripe
    const reactivatedSubscription = await stripeProvider.updateSubscription({
      subscriptionId,
      cancelAtPeriodEnd: false
    });

 await updateSubscriptionBySubscriptionId({
    subscriptionId: subscriptionId,
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    updatedAt: new Date(),
    status: 'active'
   });

    // Send reactivation email
    try {
      const emailData = {
        customerName: session.user.name || session.user.email || 'User',
        customerEmail: session.user.email!,
        planName: userSubscription?.planId || '',
        subscriptionId: subscriptionId,
        companyName: "Ever Works",
        companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
        supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works",
        manageSubscriptionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
      };

      await paymentEmailService.sendSubscriptionReactivatedEmail(emailData as any);
    } catch (emailError) {
      console.error('Failed to send reactivation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: reactivatedSubscription,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
