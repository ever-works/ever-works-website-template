import { auth } from '@/lib/auth';
import { PaymentProviderManager } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for update subscription request
const updateSubscriptionSchema = z.object({
	subscriptionId: z.string().min(1, 'Subscription ID is required'),
	status: z.enum(['active', 'cancelled', 'expired', 'on_trial', 'past_due', 'paused', 'unpaid']).optional(),
	cancelAtPeriodEnd: z.boolean().optional(),
	priceId: z.string().optional(),
	metadata: z.record(z.string(), z.any()).optional()
});

export type UpdateSubscriptionRequest = z.infer<typeof updateSubscriptionSchema>;

export async function POST(request: NextRequest) {
	const requestId = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
	const startTime = Date.now();

	try {
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json(
				{
					success: false,
					error: 'Unauthorized',
					code: 'UNAUTHORIZED',
					requestId,
					timestamp: new Date().toISOString()
				},
				{ status: 401 }
			);
		}

		const body = await request.json();
		const validationResult = updateSubscriptionSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid request data',
					code: 'VALIDATION_ERROR',
					details: validationResult.error.issues,
					requestId,
					timestamp: new Date().toISOString()
				},
				{ status: 400 }
			);
		}

		const { subscriptionId, status, cancelAtPeriodEnd, priceId, metadata } = validationResult.data;

		console.log(`[${requestId}] Updating LemonSqueezy subscription`, {
			subscriptionId,
			status,
			cancelAtPeriodEnd,
			priceId,
			userId: session.user.id,
			userEmail: session.user.email,
			timestamp: new Date().toISOString()
		});

		const lemonsqueezy = PaymentProviderManager.getLemonsqueezyProvider();
		const subscription = await lemonsqueezy.updateSubscription({
			subscriptionId,
			priceId,
			cancelAtPeriodEnd,
			metadata
		});

		if (!subscription) {
			return NextResponse.json(
				{
					success: false,
					error: 'Subscription not found or update failed',
					code: 'SUBSCRIPTION_NOT_FOUND',
					requestId,
					timestamp: new Date().toISOString()
				},
				{ status: 404 }
			);
		}

		// Log successful update
		const duration = Date.now() - startTime;
		console.log(`[${requestId}] Successfully updated subscription`, {
			subscriptionId,
			newStatus: subscription.status,
			duration: `${duration}ms`,
			timestamp: new Date().toISOString()
		});

		return NextResponse.json(
			{
				success: true,
				data: subscription,
				metadata: {
					requestId,
					timestamp: new Date().toISOString(),
					duration: `${duration}ms`,
					userId: session.user.id
				}
			},
			{
				status: 200,
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'X-Request-ID': requestId,
					'X-Response-Time': `${duration}ms`
				}
			}
		);
	} catch (error) {
		const duration = Date.now() - startTime;
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_ERROR';

		// Log the error
		console.error(`[${requestId}] Failed to update subscription`, {
			error: errorMessage,
			errorCode,
			duration: `${duration}ms`,
			timestamp: new Date().toISOString(),
			stack: error instanceof Error ? error.stack : undefined
		});

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to update subscription',
				code: errorCode,
				message: errorMessage,
				requestId,
				timestamp: new Date().toISOString(),
				duration: `${duration}ms`
			},
			{
				status:
					errorCode === 'VALIDATION_ERROR'
						? 400
						: errorCode === 'UNAUTHORIZED'
							? 401
							: errorCode === 'SUBSCRIPTION_NOT_FOUND'
								? 404
								: errorCode === 'PROVIDER_UNAVAILABLE'
									? 503
									: 500,
				headers: {
					'X-Request-ID': requestId,
					'X-Response-Time': `${duration}ms`
				}
			}
		);
	}
}
