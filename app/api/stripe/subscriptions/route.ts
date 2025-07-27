/**
 * Subscriptions API Routes
 * Handles subscription management endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/subscription.service';

// GET /api/subscriptions - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const includeHistory = searchParams.get('history') === 'true';

    if (activeOnly) {
      // Get only active subscription
      const subscription = await subscriptionService.getUserActiveSubscription(session.user.id);
      return NextResponse.json({
        data: subscription,
        plan: subscription ? subscriptionService.getPlanDisplayName(subscription.planId) : null,
        limits: subscription ? subscriptionService.getPlanLimits(subscription.planId) : null,
      });
    }

    // Get all subscriptions
    const subscriptions = await subscriptionService.getUserSubscriptions(session.user.id);
    
    // Include history if requested
    let history = null;
    if (includeHistory && subscriptions.length > 0) {
      history = await subscriptionService.getSubscriptionHistory(subscriptions[0].id);
    }

    return NextResponse.json({
      data: subscriptions,
      history,
      meta: {
        total: subscriptions.length,
        hasActive: await subscriptionService.hasActiveSubscription(session.user.id),
        currentPlan: await subscriptionService.getUserPlan(session.user.id)
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      planId,
      paymentProvider,
      subscriptionId,
      priceId,
      customerId,
      currency,
      amount,
      interval,
      intervalCount,
      startDate,
      endDate,
      trialStart,
      trialEnd,
      metadata
    } = body;

    // Validate required fields
    if (!planId || !paymentProvider || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, paymentProvider, subscriptionId' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const hasActive = await subscriptionService.hasActiveSubscription(session.user.id);
    if (hasActive) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 409 }
      );
    }

    // Create subscription
    const subscription = await subscriptionService.createSubscription({
      userId: session.user.id,
      planId,
      paymentProvider,
      subscriptionId,
      priceId,
      customerId,
      currency,
      amount,
      interval,
      intervalCount,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      trialStart: trialStart ? new Date(trialStart) : undefined,
      trialEnd: trialEnd ? new Date(trialEnd) : undefined,
      metadata
    });

    return NextResponse.json({
      data: subscription,
      message: 'Subscription created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions - Update subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, ...updateData } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required field: subscriptionId' },
        { status: 400 }
      );
    }

    // Get subscription to verify ownership
    const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update subscription
    const updatedSubscription = await subscriptionService.updateSubscription(
      subscriptionId,
      updateData
    );

    return NextResponse.json({
      data: updatedSubscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    const reason = searchParams.get('reason');
    const cancelAtPeriodEnd = searchParams.get('cancelAtPeriodEnd') === 'true';

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Get subscription to verify ownership
    const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Cancel subscription
    const cancelledSubscription = await subscriptionService.cancelSubscription(
      subscriptionId,
      reason || 'User requested cancellation',
      cancelAtPeriodEnd
    );

    return NextResponse.json({
      data: cancelledSubscription,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 