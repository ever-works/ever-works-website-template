/**
 * Subscription Expiration Cron Job
 *
 * This endpoint processes expired subscriptions by:
 * 1. Finding active subscriptions past their end date
 * 2. Updating their status to 'expired'
 * 3. Logging the status changes
 * 4. Optionally sending notification emails
 *
 * Should be called daily by Vercel cron or external scheduler.
 */

import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription.service';
import { getSubscriptionWithUser } from '@/lib/db/queries/subscription.queries';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * @swagger
 * /api/cron/subscription-expiration:
 *   get:
 *     summary: Process expired subscriptions
 *     description: |
 *       Cron job endpoint that finds and processes expired subscriptions.
 *       Updates status from 'active' to 'expired' for subscriptions past their end date.
 *       Should be called daily.
 *     tags:
 *       - Cron Jobs
 *     security:
 *       - cronSecret: []
 *     responses:
 *       200:
 *         description: Successfully processed expired subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: integer
 *                       description: Number of subscriptions updated
 *                     affectedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           subscriptionId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           email:
 *                             type: string
 *                           planId:
 *                             type: string
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized - Invalid or missing cron secret
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
	try {
		// Verify cron secret if configured
		if (CRON_SECRET) {
			const authHeader = request.headers.get('authorization');
			const providedSecret = authHeader?.replace('Bearer ', '');

			if (providedSecret !== CRON_SECRET) {
				console.warn('[SubscriptionExpiration] Unauthorized cron request');
				return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
			}
		}

		console.log('[SubscriptionExpiration] Starting expired subscription processing...');

		// Process expired subscriptions
		const result = await subscriptionService.processExpiredSubscriptions();

		// Collect affected user information for notifications
		const affectedUsers: Array<{
			subscriptionId: string;
			userId: string;
			email?: string;
			planId: string;
		}> = [];

		for (const subscription of result.subscriptions) {
			try {
				const subWithUser = await getSubscriptionWithUser(subscription.id);
				if (subWithUser) {
					affectedUsers.push({
						subscriptionId: subscription.id,
						userId: subscription.userId,
						email: subWithUser.user?.email || undefined,
						planId: subscription.planId
					});
				}
			} catch (error) {
				result.errors.push(`Failed to get user for subscription ${subscription.id}: ${error}`);
			}
		}

		// Log summary
		console.log(`[SubscriptionExpiration] Completed: ${result.processed} subscriptions expired`);
		if (result.errors.length > 0) {
			console.warn('[SubscriptionExpiration] Errors:', result.errors);
		}

		// TODO: Send notification emails to affected users
		// This can be integrated with the existing mail service
		// for (const user of affectedUsers) {
		//   await sendSubscriptionExpiredEmail(user.email, user.planId);
		// }

		return NextResponse.json({
			success: true,
			message: `Processed ${result.processed} expired subscriptions`,
			data: {
				processed: result.processed,
				affectedUsers,
				errors: result.errors,
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		console.error('[SubscriptionExpiration] Error processing expired subscriptions:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to process expired subscriptions',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
	return GET(request);
}
