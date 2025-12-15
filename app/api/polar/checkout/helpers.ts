/**
 * Builds products array for Polar checkout session.
 *
 * Order matters: trial products must precede the main subscription product
 * to ensure proper billing sequence in Polar.
 *
 * @param productId - Main subscription/product ID (required)
 * @param trialAmountId - Trial period product ID (optional)
 * @param hasTrial - Whether to include trial product
 * @returns Array of Polar product IDs
 */
export function buildCheckoutProducts(productId: string, trialAmountId?: string, hasTrial: boolean = false): string[] {
	const products: string[] = [];
	if (hasTrial && trialAmountId) {
		products.push(trialAmountId);
	}

	products.push(productId);

	return products;
}

/**
 * Sanitizes metadata to remove undefined values.
 * Polar doesn't accept undefined values in metadata.
 *
 * @param metadata - Metadata object with potentially undefined values
 * @returns Metadata object with all undefined values removed
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
	const sanitized: Record<string, any> = {};
	for (const [key, value] of Object.entries(metadata)) {
		if (value !== null && value !== undefined) {
			sanitized[key] = value;
		}
	}
	return sanitized;
}

/**
 * Creates base checkout metadata for Polar.
 *
 * @param options - Base metadata configuration
 * @returns Sanitized metadata object
 */
export function createBaseCheckoutMetadata(options: {
	userId: string;
	planId?: string;
	planName?: string;
	billingInterval?: string;
	successUrl?: string;
	cancelUrl?: string;
	trialPeriodDays?: number;
	additionalMetadata?: Record<string, any>;
}): Record<string, any> {
	const metadata: Record<string, any> = {
		userId: options.userId
	};

	if (options.planId) {
		metadata.planId = options.planId;
	}
	if (options.planName) {
		metadata.planName = options.planName;
	}
	if (options.billingInterval) {
		metadata.billingInterval = options.billingInterval;
	}
	if (options.successUrl) {
		metadata.successUrl = options.successUrl;
	}
	if (options.cancelUrl) {
		metadata.cancelUrl = options.cancelUrl;
	}
	if (options.trialPeriodDays !== undefined && options.trialPeriodDays > 0) {
		metadata.trialPeriodDays = String(options.trialPeriodDays);
	}

	// Add any additional metadata
	if (options.additionalMetadata) {
		Object.entries(options.additionalMetadata).forEach(([key, value]) => {
			if (
				value !== undefined &&
				value !== null &&
				!['planId', 'planName', 'billingInterval', 'userId', 'successUrl', 'cancelUrl'].includes(key)
			) {
				metadata[key] = value;
			}
		});
	}

	return sanitizeMetadata(metadata);
}
