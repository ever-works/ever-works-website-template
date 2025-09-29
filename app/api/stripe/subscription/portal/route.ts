import { auth, initializeStripeProvider } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/stripe/subscription/portal:
 *   post:
 *     tags: ["Stripe - Subscription Management"]
 *     summary: "Create billing portal session"
 *     description: "Creates a Stripe billing portal session for the authenticated user to manage their subscription, payment methods, and billing history. Automatically redirects back to the billing settings page after completion."
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: "Billing portal session created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: "Billing portal session ID"
 *                       example: "bps_1234567890abcdef"
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: "Billing portal URL"
 *                       example: "https://billing.stripe.com/session/abc123def456"
 *                     customer:
 *                       type: string
 *                       description: "Stripe customer ID"
 *                       example: "cus_1234567890abcdef"
 *                     return_url:
 *                       type: string
 *                       format: uri
 *                       description: "Return URL after portal session"
 *                       example: "https://example.com/settings/billing"
 *                     created:
 *                       type: integer
 *                       description: "Unix timestamp of session creation"
 *                       example: 1640995200
 *                     livemode:
 *                       type: boolean
 *                       description: "Whether session is in live mode"
 *                       example: false
 *                   required: ["id", "url", "customer", "return_url", "created", "livemode"]
 *                 message:
 *                   type: string
 *                   example: "Billing portal session created"
 *               required: ["success", "data", "message"]
 *             example:
 *               success: true
 *               data:
 *                 id: "bps_1234567890abcdef"
 *                 url: "https://billing.stripe.com/session/abc123def456"
 *                 customer: "cus_1234567890abcdef"
 *                 return_url: "https://example.com/settings/billing"
 *                 created: 1640995200
 *                 livemode: false
 *               message: "Billing portal session created"
 *       401:
 *         description: "Unauthorized - Authentication required"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: "Not found - Stripe customer ID not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Stripe customer ID not found"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create billing portal session"
 *     x-portal-features:
 *       description: "Features available in the billing portal"
 *       features:
 *         - "View and download invoices"
 *         - "Update payment methods"
 *         - "Change subscription plan"
 *         - "Cancel subscription"
 *         - "Update billing address"
 *         - "View payment history"
 *         - "Manage tax information"
 */
export async function POST() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripe = initializeStripeProvider();
        const stripeInstance = stripe.getStripeInstance();
        const stripeCustomerId = await stripe.getCustomerId(session.user as any);
        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'Stripe customer ID not found' }, { status: 404 });
        }
        const response = await stripeInstance.billingPortal.sessions.create({
                customer: stripeCustomerId!,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
        });

        console.log('response', response);

        return NextResponse.json({
            success: true,
            data: response,
            message: 'Billing portal session created'
        });
    } catch (error) {
        console.error('Error creating billing portal session:', error);
        return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
    }
}