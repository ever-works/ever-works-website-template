import { NextResponse } from 'next/server';
import { auth, initializeStripeProvider } from '@/lib/auth';
import Stripe from 'stripe';
import { getUserStripeCustomerId } from '@/lib/stripe-helpers';

// GET - List all payment methods for the current user
export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}
		const stripeProvider = initializeStripeProvider();
		const stripe = stripeProvider.getStripeInstance();

		const stripeCustomerId = await getUserStripeCustomerId(session.user.id, stripe);

		if (!stripeCustomerId) {
			return NextResponse.json({
				success: true,
				data: [],
				message: 'No payment methods found'
			});
		}


		const customer = await stripe.customers.retrieve(stripeCustomerId);
		if (typeof customer === 'string' || customer.deleted) {
			return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
		}

		const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

		// List all payment methods for the customer
		const paymentMethods = await stripe.paymentMethods.list({
			customer: stripeCustomerId,
			type: 'card',
			limit: 100 // Adjust as needed
		});

		const formattedPaymentMethods = paymentMethods.data.map((pm) => ({
			id: pm.id,
			type: pm.type,
			card: pm.card
				? {
						brand: pm.card.brand,
						last4: pm.card.last4,
						funding: pm.card.funding,
						country: pm.card.country
					}
				: null,
			billing_details: pm.billing_details,
			created: pm.created,
			metadata: pm.metadata,
			is_default: pm.id === defaultPaymentMethodId
		}));

		formattedPaymentMethods.sort((a, b) => {
			if (a.is_default && !b.is_default) return -1;
			if (!a.is_default && b.is_default) return 1;
			return b.created - a.created;
		});

		return NextResponse.json({
			success: true,
			data: formattedPaymentMethods,
			meta: {
				total: formattedPaymentMethods.length,
				default_payment_method: defaultPaymentMethodId,
				customer_id: stripeCustomerId
			}
		});
	} catch (error) {
		console.error('Error listing payment methods:', error);

		if (error instanceof Stripe.errors.StripeError) {
			return NextResponse.json({ success: false, error: error.message }, { status: 400 });
		}

		return NextResponse.json({ success: false, error: 'Failed to list payment methods' }, { status: 500 });
	}
}


