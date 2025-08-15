import { NextRequest, NextResponse } from 'next/server';
import { auth, getOrCreateStripeProvider } from '@/lib/auth';
import { CheckoutSessionParams } from '@/lib/payment/types/payment-types';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json(
				{
					error: 'Unauthorized',
					message: 'Authentication required'
				},
				{ status: 401 }
			);
		}

		// Get or create Stripe provider (singleton)
		const stripeProvider = getOrCreateStripeProvider();
		const stripe = stripeProvider.getStripeInstance();

		const {
			priceId,
			mode = 'one_time',
			trialPeriodDays = 0,
			billingInterval = 'month',
			successUrl,
			cancelUrl,
			metadata = {}
		} = await request.json();


	

		const stripeCustomerId = await stripeProvider.getCustomerId(session.user as any);
		if (!stripeCustomerId) {
			return NextResponse.json(
				{
					error: 'Failed to create customer',
					message: 'Unable to create Stripe customer'
				},
				{ status: 400 }
			);
		}

		const checkoutParams: CheckoutSessionParams = {
			customer: stripeCustomerId,
			mode,
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			success_url: successUrl,
			cancel_url: cancelUrl,
			billing_address_collection: 'auto',
			metadata: {
				...metadata,
				...session.user,
				billingInterval
			},
			ui_mode: 'hosted',
			custom_text: {
				submit: {
					message: 'Your subscription will be activated immediately after payment.'
				}
			}
		};

		// Add subscription-specific configuration
		if (mode === 'subscription') {
			checkoutParams.subscription_data = {
				metadata: {
					userId: session.user.id,
					planId: metadata.planId,
					planName: metadata.planName,
					billingInterval
				}
			};

			// Add trial period if specified
			if (trialPeriodDays > 0) {
				checkoutParams.subscription_data.trial_period_days = trialPeriodDays;
			}

			// Configure billing address collection
			checkoutParams.billing_address_collection = 'auto';

			// Configure customer details
			checkoutParams.customer_update = {
				address: 'auto',
				name: 'auto'
			};

			// Allow promotion codes
			checkoutParams.allow_promotion_codes = true;
		}

	
		const checkoutSession = await stripe.checkout.sessions.create(checkoutParams as any);
		return NextResponse.json({
			data: {
				id: checkoutSession.id,
				url: checkoutSession.url
			},
			status: 200,
			message: 'Checkout session created successfully'
		});
	} catch (error) {
		console.error('Checkout session creation error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';

		return NextResponse.json(
			{
				error: errorMessage,
				message: 'Failed to create checkout session',
				details: error instanceof Error ? error.stack : undefined
			},
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get or create Stripe provider (singleton)
		const stripeProvider = getOrCreateStripeProvider();
		const stripe = stripeProvider.getStripeInstance();

		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get('session_id');

		if (!sessionId) {
			return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
		}

		// Retrieve checkout session
		const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ['line_items', 'subscription']
		});

		return NextResponse.json({
			session: checkoutSession,
			status: checkoutSession.status,
			customer: checkoutSession.customer,
			subscription: checkoutSession.subscription
		});
	} catch (error) {
		console.error('Checkout session retrieval error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve checkout session';

		return NextResponse.json(
			{
				error: errorMessage,
				details: error instanceof Error ? error.stack : undefined
			},
			{ status: 500 }
		);
	}
}
