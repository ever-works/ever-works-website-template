import { NextRequest, NextResponse } from 'next/server';
import { auth, initializeStripeProvider } from '@/lib/auth';
import { paymentEmailService } from '@/lib/payment/services/payment-email.service';
import { updateSubscriptionBySubscriptionId } from '@/lib/db/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cancelAtPeriodEnd = true } = await request.json();
    const { subscriptionId } = await params;

    const stripeProvider = initializeStripeProvider();
     
    const cancelledSubscription = await stripeProvider.cancelSubscription(
        subscriptionId,
      cancelAtPeriodEnd
    );

 await updateSubscriptionBySubscriptionId({
      subscriptionId: subscriptionId,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      cancelledAt: cancelAtPeriodEnd ? new Date() : null,
      updatedAt: new Date(),
      status: cancelAtPeriodEnd ? 'cancelled' : 'active',
    });

    try {
      const emailData = {
        customerName: session.user.name || session.user.email || 'User',
        customerEmail: session.user.email!,
        planName: cancelledSubscription.priceId,
        subscriptionId: subscriptionId,
        cancelAtPeriodEnd,
        currentPeriodEnd: cancelledSubscription.currentPeriodEnd,
        companyName: "Ever Works",
        companyUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ever.works",
        supportEmail: process.env.SUPPORT_EMAIL || "support@ever.works",
        reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
      };

      if (cancelAtPeriodEnd) {
        await paymentEmailService.sendSubscriptionCancellingEmail(emailData as any);
      } else {
        await paymentEmailService.sendSubscriptionCancellingEmail(emailData as any);
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: cancelledSubscription,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription cancelled immediately'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
