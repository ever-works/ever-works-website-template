import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { StripeProvider } from '@/lib/payment/lib/providers/stripe-provider';
import { createProviderConfigs } from '@/lib/payment/config/provider-configs';
import { db } from '@/lib/db/drizzle';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PaymentPlan } from '@/lib/constants';
import { getSubscriptionByProviderSubscriptionId } from '@/lib/db/queries';
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

    const { newPlanId, newPriceId } = await request.json();
    const { subscriptionId } = await params;

    // Validate the new plan
    if (!Object.values(PaymentPlan).includes(newPlanId)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
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

    // Verify the subscription belongs to the user
    const userSubscription = await getSubscriptionByProviderSubscriptionId('stripe',subscriptionId);

    if (!userSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found or access denied' },
        { status: 404 }
      );
    }

    const subscription = userSubscription;

    // Check if subscription is active
    if (subscription.status !== 'active'  && subscription.status !== 'pending' && subscription.status !== 'paused') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Update the subscription in Stripe
    const updatedSubscription = await stripeProvider.updateSubscription({
      subscriptionId,
      priceId: newPriceId,
    });

    // Update the subscription in the database
    await db
      .update(subscriptions)
      .set({
        planId: newPlanId,
        priceId: newPriceId,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.subscriptionId, subscriptionId));

    // Send plan change email
    try {
      const emailData = {
        customerName: session.user.name || session.user.email || 'User',
        customerEmail: session.user.email!,
        oldPlanName: subscription.planId,
        newPlanName: newPlanId,
        subscriptionId: subscriptionId,
        companyName: "Ever Works",
        companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
        supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works",
        manageSubscriptionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
      };

      await paymentEmailService.sendSubscriptionPlanChangedEmail(emailData);
    } catch (emailError) {
      console.error('Failed to send plan change email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: `Plan updated to ${newPlanId} successfully`
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
