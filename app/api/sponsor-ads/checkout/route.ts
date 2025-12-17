import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sponsorAdService } from "@/lib/services/sponsor-ad.service";
import { SponsorAdStatus, SponsorAdInterval } from "@/lib/db/schema";
import { PaymentProvider } from "@/lib/constants";
import {
	getOrCreateStripeProvider,
	getOrCreateLemonsqueezyProvider,
	getOrCreatePolarProvider,
} from "@/lib/payment/config/payment-provider-manager";
import type { CheckoutSessionParams } from "@/lib/payment/types/payment-types";

// Environment variables for sponsor ad price IDs
const STRIPE_SPONSOR_WEEKLY_PRICE_ID = process.env.STRIPE_SPONSOR_WEEKLY_PRICE_ID;
const STRIPE_SPONSOR_MONTHLY_PRICE_ID = process.env.STRIPE_SPONSOR_MONTHLY_PRICE_ID;
const LEMONSQUEEZY_SPONSOR_WEEKLY_VARIANT_ID = process.env.LEMONSQUEEZY_SPONSOR_WEEKLY_VARIANT_ID;
const LEMONSQUEEZY_SPONSOR_MONTHLY_VARIANT_ID = process.env.LEMONSQUEEZY_SPONSOR_MONTHLY_VARIANT_ID;
const POLAR_SPONSOR_WEEKLY_PRICE_ID = process.env.POLAR_SPONSOR_WEEKLY_PRICE_ID;
const POLAR_SPONSOR_MONTHLY_PRICE_ID = process.env.POLAR_SPONSOR_MONTHLY_PRICE_ID;

// Determine which payment provider to use
const ACTIVE_PAYMENT_PROVIDER = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || PaymentProvider.STRIPE;

const appUrl = process.env.NEXT_PUBLIC_APP_URL ??
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * @swagger
 * /api/sponsor-ads/checkout:
 *   post:
 *     tags: ["Sponsor Ads"]
 *     summary: "Create sponsor ad checkout session"
 *     description: "Creates a checkout session for an approved sponsor ad. The sponsor ad must be in 'approved' status."
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sponsorAdId
 *             properties:
 *               sponsorAdId:
 *                 type: string
 *                 description: "ID of the approved sponsor ad"
 *               successUrl:
 *                 type: string
 *                 description: "URL to redirect after successful payment"
 *               cancelUrl:
 *                 type: string
 *                 description: "URL to redirect after cancelled payment"
 *     responses:
 *       200:
 *         description: "Checkout session created successfully"
 *       400:
 *         description: "Bad request - Sponsor ad not approved or missing price configuration"
 *       401:
 *         description: "Unauthorized"
 *       403:
 *         description: "Forbidden - User does not own this sponsor ad"
 *       404:
 *         description: "Sponsor ad not found"
 *       500:
 *         description: "Internal server error"
 */
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { sponsorAdId, successUrl, cancelUrl } = body;

		if (!sponsorAdId) {
			return NextResponse.json(
				{ success: false, error: "Sponsor ad ID is required" },
				{ status: 400 }
			);
		}

		// Get the sponsor ad
		const sponsorAd = await sponsorAdService.getSponsorAdById(sponsorAdId);

		if (!sponsorAd) {
			return NextResponse.json(
				{ success: false, error: "Sponsor ad not found" },
				{ status: 404 }
			);
		}

		// Verify ownership
		if (sponsorAd.userId !== session.user.id) {
			return NextResponse.json(
				{ success: false, error: "You do not have permission to pay for this sponsor ad" },
				{ status: 403 }
			);
		}

		// Check if sponsor ad is approved
		if (sponsorAd.status !== SponsorAdStatus.APPROVED) {
			return NextResponse.json(
				{
					success: false,
					error: `Sponsor ad must be approved before payment. Current status: ${sponsorAd.status}`
				},
				{ status: 400 }
			);
		}

		// Get price ID based on interval and provider
		const priceId = getPriceId(sponsorAd.interval, ACTIVE_PAYMENT_PROVIDER);

		if (!priceId) {
			return NextResponse.json(
				{
					success: false,
					error: `Price not configured for ${sponsorAd.interval} interval with ${ACTIVE_PAYMENT_PROVIDER} provider`
				},
				{ status: 400 }
			);
		}

		// Build success/cancel URLs
		const finalSuccessUrl = successUrl || `${appUrl}/sponsor/success?sponsorAdId=${sponsorAdId}`;
		const finalCancelUrl = cancelUrl || `${appUrl}/sponsor?cancelled=true`;

		// Create checkout session based on provider
		let checkoutResult: { id: string; url: string | null };

		switch (ACTIVE_PAYMENT_PROVIDER) {
			case PaymentProvider.STRIPE:
				checkoutResult = await createStripeCheckout(
					session.user,
					sponsorAd,
					priceId,
					finalSuccessUrl,
					finalCancelUrl
				);
				break;

			case PaymentProvider.LEMONSQUEEZY:
				checkoutResult = await createLemonSqueezyCheckout(
					session.user,
					sponsorAd,
					priceId,
					finalSuccessUrl,
					finalCancelUrl
				);
				break;

			case PaymentProvider.POLAR:
				checkoutResult = await createPolarCheckout(
					session.user,
					sponsorAd,
					priceId,
					finalSuccessUrl,
					finalCancelUrl
				);
				break;

			default:
				return NextResponse.json(
					{ success: false, error: `Unsupported payment provider: ${ACTIVE_PAYMENT_PROVIDER}` },
					{ status: 400 }
				);
		}

		return NextResponse.json({
			success: true,
			data: {
				checkoutId: checkoutResult.id,
				checkoutUrl: checkoutResult.url,
				provider: ACTIVE_PAYMENT_PROVIDER,
			},
			message: "Checkout session created successfully",
		});
	} catch (error) {
		console.error("Error creating sponsor ad checkout:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to create checkout session";

		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}

/**
 * Get price ID based on interval and provider
 */
function getPriceId(interval: string, provider: string): string | null {
	if (provider === PaymentProvider.STRIPE) {
		if (interval === SponsorAdInterval.WEEKLY) {
			return STRIPE_SPONSOR_WEEKLY_PRICE_ID || null;
		}
		if (interval === SponsorAdInterval.MONTHLY) {
			return STRIPE_SPONSOR_MONTHLY_PRICE_ID || null;
		}
	}

	if (provider === PaymentProvider.LEMONSQUEEZY) {
		if (interval === SponsorAdInterval.WEEKLY) {
			return LEMONSQUEEZY_SPONSOR_WEEKLY_VARIANT_ID || null;
		}
		if (interval === SponsorAdInterval.MONTHLY) {
			return LEMONSQUEEZY_SPONSOR_MONTHLY_VARIANT_ID || null;
		}
	}

	if (provider === PaymentProvider.POLAR) {
		if (interval === SponsorAdInterval.WEEKLY) {
			return POLAR_SPONSOR_WEEKLY_PRICE_ID || null;
		}
		if (interval === SponsorAdInterval.MONTHLY) {
			return POLAR_SPONSOR_MONTHLY_PRICE_ID || null;
		}
	}

	return null;
}

/**
 * Create Stripe checkout session
 */
async function createStripeCheckout(
	user: { id?: string; email?: string | null; name?: string | null },
	sponsorAd: { id: string; itemSlug: string; itemName: string; interval: string; amount: number },
	priceId: string,
	successUrl: string,
	cancelUrl: string
): Promise<{ id: string; url: string | null }> {
	const stripeProvider = getOrCreateStripeProvider();
	const stripe = stripeProvider.getStripeInstance();

	// Get or create customer
	const customerId = await stripeProvider.getCustomerId(user as Parameters<typeof stripeProvider.getCustomerId>[0]);

	if (!customerId) {
		throw new Error("Failed to create Stripe customer");
	}

	const checkoutParams: CheckoutSessionParams = {
		customer: customerId,
		mode: "subscription",
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		success_url: successUrl,
		cancel_url: cancelUrl,
		billing_address_collection: "auto",
		metadata: {
			sponsorAdId: sponsorAd.id,
			itemSlug: sponsorAd.itemSlug,
			itemName: sponsorAd.itemName,
			type: "sponsor_ad",
		},
		subscription_data: {
			metadata: {
				userId: user.id || "",
				sponsorAdId: sponsorAd.id,
				itemSlug: sponsorAd.itemSlug,
				type: "sponsor_ad",
			},
		},
	};

	const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

	return {
		id: checkoutSession.id,
		url: checkoutSession.url,
	};
}

/**
 * Create LemonSqueezy checkout session
 */
async function createLemonSqueezyCheckout(
	user: { id?: string; email?: string | null; name?: string | null },
	sponsorAd: { id: string; itemSlug: string; itemName: string; interval: string; amount: number },
	variantId: string,
	successUrl: string,
	cancelUrl: string
): Promise<{ id: string; url: string | null }> {
	const lemonProvider = getOrCreateLemonsqueezyProvider();

	const result = await lemonProvider.createSubscription({
		variantId: variantId,
		email: user.email || undefined,
		metadata: {
			userId: user.id || "",
			sponsorAdId: sponsorAd.id,
			itemSlug: sponsorAd.itemSlug,
			itemName: sponsorAd.itemName,
			type: "sponsor_ad",
			successUrl: successUrl,
			name: sponsorAd.itemName,
			description: `Sponsor ad for ${sponsorAd.itemName}`,
		},
	});

	return {
		id: result.id || "",
		url: result.checkoutData?.url || null,
	};
}

/**
 * Create Polar checkout session
 */
async function createPolarCheckout(
	user: { id?: string; email?: string | null; name?: string | null },
	sponsorAd: { id: string; itemSlug: string; itemName: string; interval: string; amount: number },
	priceId: string,
	successUrl: string,
	cancelUrl: string
): Promise<{ id: string; url: string | null }> {
	const polarProvider = getOrCreatePolarProvider();

	// Get or create customer ID
	const customerId = await polarProvider.getCustomerId(user as Parameters<typeof polarProvider.getCustomerId>[0]);

	const result = await polarProvider.createSubscription({
		customerId: customerId || undefined,
		priceId: priceId,
		metadata: {
			userId: user.id || "",
			sponsorAdId: sponsorAd.id,
			itemSlug: sponsorAd.itemSlug,
			itemName: sponsorAd.itemName,
			type: "sponsor_ad",
			successUrl: successUrl,
			cancelUrl: cancelUrl,
		},
	});

	return {
		id: result.id || "",
		url: result.checkoutData?.url || null,
	};
}
