import { SubscriptionInfo, SubscriptionStatus } from '../../types/payment-types';

/**
 * Interface for the parameters needed for cancellation operations
 */
export interface PolarCancelSubscriptionParams {
	subscriptionId: string;
	apiKey: string;
	apiUrl: string;
	formatErrorMessage: (error: unknown) => string;
	logger: {
		error: (message: string, context?: Record<string, any>) => void;
		warn: (message: string, context?: Record<string, any>) => void;
		info: (message: string, context?: Record<string, any>) => void;
	};
}

/**
 * Validate and sanitize subscription ID to prevent SSRF attacks
 * Only allows alphanumeric characters, hyphens, and underscores
 * @param subscriptionId - The subscription ID to validate
 * @returns The sanitized subscription ID
 * @throws Error if the subscription ID is invalid
 */
export function validateSubscriptionId(subscriptionId: string): string {
	if (!subscriptionId || typeof subscriptionId !== 'string') {
		throw new Error('Subscription ID is required and must be a string');
	}

	const trimmed = subscriptionId.trim();
	
	if (trimmed.length === 0) {
		throw new Error('Subscription ID cannot be empty');
	}

	// Limit length to prevent extremely long IDs (reasonable limit: 255 characters)
	if (trimmed.length > 255) {
		throw new Error('Subscription ID is too long');
	}

	// Only allow alphanumeric characters, hyphens, and underscores
	// This prevents SSRF attacks by blocking URL manipulation characters
	const validIdPattern = /^[a-zA-Z0-9_-]+$/;
	if (!validIdPattern.test(trimmed)) {
		throw new Error('Subscription ID contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed.');
	}

	return trimmed;
}

/**
 * Interface for the parameters needed for reactivation operations
 */
export interface PolarReactivateSubscriptionParams extends PolarCancelSubscriptionParams {
	timeout?: number; // Request timeout in milliseconds (default: 30000)
}

/**
 * Retrieve a Polar subscription by its ID
 */
export async function getPolarSubscription(
	subscriptionId: string,
	polarClient: any,
	params: Pick<PolarCancelSubscriptionParams, 'formatErrorMessage' | 'logger'>,
	operation: string = 'operation'
): Promise<any> {
	// Validate and sanitize subscription ID to prevent SSRF attacks
	const validatedSubscriptionId = validateSubscriptionId(subscriptionId);
	
	try {
		return await polarClient.subscriptions.get({ id: validatedSubscriptionId } as any);
	} catch (getError) {
		params.logger.error(`Failed to get subscription before ${operation}`, {
			error: params.formatErrorMessage(getError),
			subscriptionId: validatedSubscriptionId
		});
		throw new Error(`Failed to retrieve subscription: ${params.formatErrorMessage(getError)}`);
	}
}

/**
 * Cancel a Polar subscription immediately via the REST API
 */
export async function cancelSubscriptionImmediately(
	subscriptionId: string,
	existingSubscription: any,
	params: PolarCancelSubscriptionParams
): Promise<SubscriptionInfo> {
	const { apiUrl, apiKey, formatErrorMessage, logger } = params;

	// Validate and sanitize subscription ID to prevent SSRF attacks
	const validatedSubscriptionId = validateSubscriptionId(subscriptionId);

	const response = await fetch(`${apiUrl}/v1/subscriptions/${validatedSubscriptionId}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => 'Unknown error');
		logger.error('Failed to cancel subscription immediately', {
			status: response.status,
			error: errorText,
			subscriptionId: validatedSubscriptionId
		});
		throw new Error(`Failed to cancel subscription immediately: ${errorText}`);
	}

	const cancelledSubscription = await response.json().catch(() => ({}));

	return mapPolarSubscriptionToInfo(
		cancelledSubscription,
		validatedSubscriptionId,
		existingSubscription,
		'canceled',
		false
	);
}

/**
 * Cancel a Polar subscription at the end of the period via the REST API
 */
export async function cancelSubscriptionAtPeriodEnd(
	subscriptionId: string,
	existingSubscription: any,
	params: PolarCancelSubscriptionParams
): Promise<SubscriptionInfo> {
	const { apiUrl, apiKey, formatErrorMessage, logger } = params;

	// Validate and sanitize subscription ID to prevent SSRF attacks
	const validatedSubscriptionId = validateSubscriptionId(subscriptionId);

	const updateResponse = await fetch(`${apiUrl}/v1/subscriptions/${validatedSubscriptionId}`, {
		method: 'PATCH',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			cancel_at_period_end: true
		})
	});

	if (!updateResponse.ok) {
		const errorText = await updateResponse.text().catch(() => 'Unknown error');
		logger.error('Failed to update subscription', {
			status: updateResponse.status,
			error: errorText,
			subscriptionId: validatedSubscriptionId
		});
		throw new Error(`Failed to update subscription: ${errorText}`);
	}

	const updatedSubscription = await updateResponse.json().catch(() => existingSubscription);

	return mapPolarSubscriptionToInfo(
		updatedSubscription,
		validatedSubscriptionId,
		existingSubscription,
		'active',
		true
	);
}

/**
 * Map the data of a Polar subscription to SubscriptionInfo
 */
export function mapPolarSubscriptionToInfo(
	subscription: any,
	subscriptionId: string,
	fallbackSubscription: any,
	defaultStatus: string,
	defaultCancelAtPeriodEnd: boolean
): SubscriptionInfo {
	// Use the data of subscription in priority, otherwise fallbackSubscription
	const source = subscription || fallbackSubscription || {};

	// Extract the customerId with several possible formats
	const customerId = 
		source.customer?.id || 
		source.customerId || 
		fallbackSubscription?.customer?.id || 
		fallbackSubscription?.customerId || 
		'';

	// Extract the priceId with several possible formats (including product as fallback)
	const priceId = 
		source.price?.id || 
		source.priceId || 
		source.product?.id ||
		source.productId ||
		fallbackSubscription?.price?.id || 
		fallbackSubscription?.priceId || 
		fallbackSubscription?.product?.id ||
		fallbackSubscription?.productId ||
		'';

	// Extract the status with fallback
	const status = source.status || defaultStatus;

	// Extract the currentPeriodEnd with management of formats (snake_case and camelCase)
	// Try source first, then fallbackSubscription
	const currentPeriodEnd = 
		source.current_period_end 
			? new Date(source.current_period_end).getTime() / 1000
			: source.currentPeriodEnd 
				? new Date(source.currentPeriodEnd).getTime() / 1000 
				: fallbackSubscription?.current_period_end
					? new Date(fallbackSubscription.current_period_end).getTime() / 1000
					: fallbackSubscription?.currentPeriodEnd
						? new Date(fallbackSubscription.currentPeriodEnd).getTime() / 1000
						: undefined;

	// Extract the cancelAtPeriodEnd with management of formats
	const cancelAtPeriodEnd = 
		source.cancel_at_period_end !== undefined 
			? source.cancel_at_period_end
			: source.cancelAtPeriodEnd !== undefined 
				? source.cancelAtPeriodEnd 
				: defaultCancelAtPeriodEnd;

	return {
		id: source.id || subscriptionId,
		customerId,
		status: mapSubscriptionStatus(status),
		currentPeriodEnd,
		cancelAtPeriodEnd,
		priceId
	};
}

/**
 * Map the Polar status to SubscriptionStatus
 */
export function mapSubscriptionStatus(status: string): SubscriptionStatus {
	const statusMap: Record<string, SubscriptionStatus> = {
		active: SubscriptionStatus.ACTIVE,
		trialing: SubscriptionStatus.TRIALING,
		past_due: SubscriptionStatus.PAST_DUE,
		canceled: SubscriptionStatus.CANCELED,
		unpaid: SubscriptionStatus.UNPAID,
		incomplete: SubscriptionStatus.INCOMPLETE,
		incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED
	};

	return statusMap[status.toLowerCase()] || SubscriptionStatus.INCOMPLETE;
}

/**
 * Validate inputs for subscription reactivation
 */
export function validateReactivateInputs(
	subscriptionId: string,
	apiKey: string
): void {
	// Use the centralized validation function to prevent SSRF attacks
	validateSubscriptionId(subscriptionId);

	if (!apiKey || apiKey.trim().length === 0) {
		throw new Error('Polar API key is not configured. Please set POLAR_ACCESS_TOKEN environment variable.');
	}
}

/**
 * Check if subscription is scheduled for cancellation
 */
export function isScheduledForCancellation(subscription: any): boolean {
	return (
		subscription?.cancel_at_period_end === true ||
		subscription?.cancelAtPeriodEnd === true
	);
}

/**
 * Parse error response from Polar API
 */
export function parsePolarErrorResponse(errorText: string): string {
	try {
		const errorData = JSON.parse(errorText);
		if (errorData.error_description) {
			return errorData.error_description;
		}
		if (errorData.message) {
			return errorData.message;
		}
	} catch {
		// Use the raw error text if parsing fails
	}
	return errorText;
}

/**
 * Create user-friendly error message from Polar API error
 */
export function createUserFriendlyError(
	errorMessage: string,
	subscriptionId: string
): Error {
	if (errorMessage.includes('not found') || errorMessage.includes('404')) {
		return new Error(`Subscription not found: ${subscriptionId}. Please verify the subscription ID.`);
	}

	if (errorMessage.includes('invalid_token') || 
		errorMessage.includes('401') || 
		errorMessage.includes('403') || 
		errorMessage.includes('authentication')) {
		return new Error('Polar API authentication failed. Please verify your POLAR_ACCESS_TOKEN is valid and has not expired.');
	}

	if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
		return new Error('Polar API rate limit exceeded. Please try again in a few moments.');
	}

	return new Error(`Failed to reactivate subscription: ${errorMessage}`);
}

/**
 * Reactivate a Polar subscription via the REST API
 */
export async function reactivatePolarSubscription(
	subscriptionId: string,
	existingSubscription: any,
	params: PolarReactivateSubscriptionParams
): Promise<SubscriptionInfo> {
	const { apiUrl, apiKey, formatErrorMessage, logger, timeout = 30000 } = params;
	
	// Validate and sanitize subscription ID to prevent SSRF attacks
	const validatedSubscriptionId = validateSubscriptionId(subscriptionId);
	const endpoint = `${apiUrl}/v1/subscriptions/${validatedSubscriptionId}`;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(endpoint, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${apiKey.trim()}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				cancel_at_period_end: false
			}),
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			const errorText = await response.text().catch(() => 'Unknown error');
			const parsedError = parsePolarErrorResponse(errorText);
			const errorMessage = `Polar API error (${response.status}): ${parsedError}`;

			logger.error('Failed to reactivate subscription', {
				status: response.status,
				error: parsedError,
				subscriptionId: validatedSubscriptionId
			});

			throw new Error(errorMessage);
		}

		const reactivatedSubscription = await response.json().catch(() => existingSubscription);

		return mapPolarSubscriptionToInfo(
			reactivatedSubscription,
			validatedSubscriptionId,
			existingSubscription,
			'active',
			false
		);
	} catch (error) {
		clearTimeout(timeoutId);

		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('Request timeout: Polar API did not respond within 30 seconds');
		}

		throw error;
	}
}

