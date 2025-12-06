/**
 * Event router for Polar webhook events
 */

import { WebhookEventType } from '@/lib/payment/types/payment-types';
import { Logger } from '@/lib/logger';
import type { PolarWebhookData } from './types';
import {
	handlePaymentSucceeded,
	handlePaymentFailed,
	handleSubscriptionCreated,
	handleSubscriptionUpdated,
	handleSubscriptionCancelled,
	handleSubscriptionPaymentSucceeded,
	handleSubscriptionPaymentFailed
} from './handlers';

const logger = Logger.create('PolarWebhookRouter');

/**
 * Routes webhook events to appropriate handlers
 */
export async function routeWebhookEvent(
	eventType: string,
	data: PolarWebhookData
): Promise<void> {
	const eventHandlers: Record<string, (data: PolarWebhookData) => Promise<void>> = {
		[WebhookEventType.SUBSCRIPTION_CREATED]: handleSubscriptionCreated,
		[WebhookEventType.SUBSCRIPTION_UPDATED]: handleSubscriptionUpdated,
		[WebhookEventType.SUBSCRIPTION_CANCELLED]: handleSubscriptionCancelled,
		[WebhookEventType.PAYMENT_SUCCEEDED]: handlePaymentSucceeded,
		[WebhookEventType.SUBSCRIPTION_PAYMENT_SUCCEEDED]: handleSubscriptionPaymentSucceeded,
		[WebhookEventType.SUBSCRIPTION_PAYMENT_FAILED]: handleSubscriptionPaymentFailed,
		[WebhookEventType.PAYMENT_FAILED]: handlePaymentFailed,
	};

	const handler = eventHandlers[eventType];

	if (handler) {
		await handler(data);
	} else {
		logger.warn('Unhandled webhook event type', { eventType, dataId: data.id || 'unknown' });
	}
}
