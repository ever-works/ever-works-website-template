import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/subscription.service';
import { getOrCreateProvider } from '@/lib/payment/config/payment-provider-manager';
import { PaymentProvider } from '@/lib/constants';

/**
 * PATCH /api/payment/[subscriptionId]
 * Enable or disable auto-renewal for a subscription
 * Works with all payment providers (Stripe, LemonSqueezy, Polar, etc.)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ subscriptionId: string }> }) {
	try {
		// Authenticate user
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { subscriptionId } = await params;
		const body = await request.json();
		const { enabled, paymentProvider } = body;
		const provider = paymentProvider || 'stripe';

		if (typeof enabled !== 'boolean') {
			return NextResponse.json({ error: 'Invalid request body. "enabled" must be a boolean.' }, { status: 400 });
		}

		// Verify the subscription belongs to the user
		const subscription = await subscriptionService.getSubscriptionByProviderSubscriptionId(
			provider,
			subscriptionId
		);
		if (!subscription) {
			return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
		}

		if (subscription.userId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden: You do not own this subscription' }, { status: 403 });
		}

		// Update auto-renewal status in local database (use internal ID)
		const updatedSubscription = await subscriptionService.setAutoRenewal(subscription.id, enabled);
		if (!updatedSubscription) {
			return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
		}

		// Sync with payment provider if subscription has a provider subscription ID
		if (subscriptionId && provider) {
			try {
				const paymentProvider = provider as PaymentProvider;

				// Get the appropriate payment provider instance
				const paymentProviderInstance = getOrCreateProvider(paymentProvider);

				// Update subscription with the provider
				await paymentProviderInstance.updateSubscription({
					subscriptionId,
					cancelAtPeriodEnd: !enabled,
					metadata: {
						autoRenewal: enabled.toString()
					}
				});
			} catch (providerError) {
				console.error(`Failed to sync with ${provider}:`, providerError);
				// Continue anyway - local DB is updated
				// The webhook will eventually sync the state
			}
		}

		return NextResponse.json({
			success: true,
			subscription: updatedSubscription,
			message: enabled
				? 'Auto-renewal has been enabled. Your subscription will renew automatically.'
				: 'Auto-renewal has been disabled. Your subscription will not renew after the current period ends.'
		});
	} catch (error) {
		console.error('Error updating auto-renewal:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * GET /api/payment/[subscriptionId]
 * Get the current auto-renewal status for a subscription
 * Works with all payment providers (Stripe, LemonSqueezy, Polar, etc.)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ subscriptionId: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { subscriptionId } = await params;

		// Get provider from query parameters
		const { searchParams } = new URL(request.url);
		const provider = searchParams.get('provider') || 'stripe';

		const subscription = await subscriptionService.getSubscriptionByProviderSubscriptionId(
			provider,
			subscriptionId
		);

		if (!subscription) {
			return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
		}

		if (subscription.userId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden: You do not own this subscription' }, { status: 403 });
		}

		return NextResponse.json({
			subscriptionId,
			autoRenewal: subscription.autoRenewal ?? true,
			cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
			endDate: subscription.endDate
		});
	} catch (error) {
		console.error('Error getting auto-renewal status:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
