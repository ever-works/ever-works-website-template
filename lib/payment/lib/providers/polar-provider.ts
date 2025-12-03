import { User } from '@supabase/auth-js';
import React from 'react';
import { Polar } from '@polar-sh/sdk';
import {
	PaymentProviderInterface,
	PaymentIntent,
	PaymentVerificationResult,
	WebhookResult,
	CreatePaymentParams,
	ClientConfig,
	PaymentProviderConfig,
	CreateCustomerParams,
	CustomerResult,
	CreateSubscriptionParams,
	SubscriptionInfo,
	UpdateSubscriptionParams,
	SetupIntent,
	UIComponents,
	CardBrandIcon,
	PaymentFormProps,
	SubscriptionStatus
} from '../../types/payment-types';
import { paymentAccountClient } from '../client/payment-account-client';

/**
 * Custom error class for fatal Polar API errors that should not trigger fallback
 */
class PolarFatalError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PolarFatalError';
		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, PolarFatalError);
		}
	}
}

export interface PolarConfig extends PaymentProviderConfig {
	apiKey: string;
	webhookSecret: string;
	options?: {
		organizationId?: string;
		appUrl?: string;
	};
}

const polarCardBrands: CardBrandIcon[] = [
	{
		name: 'visa',
		lightIcon: '/assets/payment/polar/visa-light.svg',
		darkIcon: '/assets/payment/polar/visa-dark.svg',
		width: 40,
		height: 25
	},
	{
		name: 'mastercard',
		lightIcon: '/assets/payment/polar/mastercard-light.svg',
		darkIcon: '/assets/payment/polar/mastercard-dark.svg',
		width: 40,
		height: 25
	},
	{
		name: 'amex',
		lightIcon: '/assets/payment/polar/amex-light.svg',
		darkIcon: '/assets/payment/polar/amex-dark.svg',
		width: 40,
		height: 25
	}
];

// Mock translations - would be actual translations in real implementation
const polarTranslations = {
	en: {
		cardNumber: 'Card number',
		cardExpiry: 'Expiration date',
		cardCvc: 'CVC',
		submit: 'Pay now',
		processingPayment: 'Processing payment...',
		paymentSuccessful: 'Payment successful',
		paymentFailed: 'Payment failed'
	},
	fr: {
		cardNumber: 'Numéro de carte',
		cardExpiry: 'Date d\'expiration',
		cardCvc: 'CVC',
		submit: 'Payer maintenant',
		processingPayment: 'Traitement du paiement...',
		paymentSuccessful: 'Paiement réussi',
		paymentFailed: 'Échec du paiement'
	}
};

export class PolarProvider implements PaymentProviderInterface {
	private polar: Polar;
	private webhookSecret: string;
	private organizationId?: string;
	private appUrl?: string;
	private apiKey: string;

	constructor(config: PolarConfig) {
		if (!config.apiKey) {
			throw new Error('Polar API key is required');
		}

		this.apiKey = config.apiKey;
		this.polar = new Polar({
			accessToken: config.apiKey
		});
		this.webhookSecret = config.webhookSecret || '';
		this.organizationId = config.options?.organizationId;
		this.appUrl = config.options?.appUrl || process.env.NEXT_PUBLIC_APP_URL || '';

		if (!this.organizationId) {
			throw new Error('Polar organization ID is required');
		}
	}

	hasCustomerId(user: User | null): boolean {
		return !!user?.user_metadata?.polar_customer_id;
	}

	private isValidUser(user: User | null): user is User {
		return user !== null && typeof user.id === 'string' && user.id.length > 0;
	}

	private extractCustomerIdFromMetadata(user: User): string | null {
		if (!this.hasCustomerId(user)) {
			return null;
		}

		const customerId = user.user_metadata?.polar_customer_id;
		return typeof customerId === 'string' && customerId.length > 0 ? customerId : null;
	}

	async getCustomerId(user: User | null): Promise<string | null> {
		const userId = user?.id;
		if (!this.isValidUser(user)) {
			this.logger.warn('getCustomerId: Invalid or disconnected user', { userId: userId || 'undefined' });
			return null;
		}
		const validatedUserId = user.id;
		this.logger.info('Starting Polar customer retrieval/creation', { userId: validatedUserId });

		try {
			const customerIdFromMetadata = this.extractCustomerIdFromMetadata(user);
			if (customerIdFromMetadata) {
				this.logger.info('Polar customer retrieved from metadata', {
					userId: validatedUserId,
					customerId: customerIdFromMetadata
				});
				return customerIdFromMetadata;
			}
			const customerIdFromDatabase = await this.retrieveCustomerIdFromDatabase(validatedUserId);
			if (customerIdFromDatabase) {
				this.logger.info('Polar customer retrieved from database', {
					userId: validatedUserId,
					customerId: customerIdFromDatabase
				});
				return customerIdFromDatabase;
			}
			this.logger.info('Creating new Polar customer', { userId: validatedUserId });
			const newCustomer = await this.createNewPolarCustomer(user);
			await this.synchronizePaymentAccount(validatedUserId, newCustomer.id);

			this.logger.info('New Polar customer created successfully', {
				userId: validatedUserId,
				customerId: newCustomer.id
			});
			return newCustomer.id;
		} catch (error) {
			const errorMessage = this.formatErrorMessage(error);
			this.logger.error('Failed to retrieve/create Polar customer', {
				userId: validatedUserId,
				error: errorMessage
			});
			throw new Error(`Unable to retrieve/create Polar customer: ${errorMessage}`);
		}
	}

	private async retrieveCustomerIdFromDatabase(userId: string): Promise<string | null> {
		try {
			const existingPaymentAccount = await paymentAccountClient.getPaymentAccount(userId, 'polar');

			if (existingPaymentAccount?.customerId) {
				this.logger.debug('Existing PaymentAccount found in database', {
					userId,
					accountId: existingPaymentAccount.id,
					customerId: existingPaymentAccount.customerId
				});
				return existingPaymentAccount.customerId;
			}

			this.logger.debug('No existing PaymentAccount found in database', { userId });
			return null;
		} catch (error) {
			// Handle 404 errors gracefully (account doesn't exist yet)
			if (error instanceof Error && error.message.includes('404')) {
				this.logger.debug('Payment account not found (404) - this is expected for new users', { userId });
				return null;
			}

			this.logger.warn('Error retrieving from database', {
				userId,
				error: this.formatErrorMessage(error)
			});
			return null;
		}
	}

	private async createNewPolarCustomer(user: User): Promise<CustomerResult> {
		const customerData = this.buildCustomerData(user);
		try {
			const customer = await this.createCustomer(customerData);
			this.logger.debug('Polar customer created successfully', {
				userId: user.id,
				customerId: customer.id,
				email: customer.email
			});
			return customer;
		} catch (error) {
			this.logger.error('Failed to create Polar customer', {
				userId: user.id,
				error: this.formatErrorMessage(error),
				customerData
			});
			throw error;
		}
	}

	/**
	 * Remove undefined values from metadata object
	 * Polar doesn't accept undefined values in metadata
	 */
	private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
		const sanitized: Record<string, any> = {};
		for (const [key, value] of Object.entries(metadata)) {
			if (value !== undefined && value !== null) {
				sanitized[key] = value;
			}
		}
		return sanitized;
	}

	private buildCustomerData(user: User): CreateCustomerParams {
		const metadata: Record<string, any> = {
			userId: user.id
		};

		// Only add optional fields if they exist
		if (user.user_metadata?.planId) {
			metadata.planId = user.user_metadata.planId;
		}
		if (user.user_metadata?.planName) {
			metadata.planName = user.user_metadata.planName;
		}
		if (user.user_metadata?.billingInterval) {
			metadata.billingInterval = user.user_metadata.billingInterval;
		}

		return {
			email: user.email || '',
			name: user.user_metadata?.name || undefined,
			metadata: this.sanitizeMetadata(metadata)
		};
	}

	private async synchronizePaymentAccount(userId: string, customerId: string): Promise<void> {
		try {
			const paymentAccount = await paymentAccountClient.setupPaymentAccount({
				provider: 'polar',
				userId,
				customerId
			});
			this.logger.info('PaymentAccount synchronized successfully in database', {
				userId,
				customerId,
				accountId: paymentAccount.id,
				providerId: paymentAccount.providerId
			});
		} catch (error) {
			// Handle duplicate key constraint violations
			if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
				this.logger.warn('Payment account already exists - attempting to update', {
					userId,
					customerId,
					error: this.formatErrorMessage(error)
				});

				// Try to get the existing account and update it
				try {
					const existingAccount = await paymentAccountClient.getPaymentAccount(userId, 'polar');
					if (existingAccount) {
						this.logger.info('Found existing payment account - synchronization completed', {
							userId,
							customerId,
							accountId: existingAccount.id
						});
						return;
					}
				} catch (updateError) {
					this.logger.error('Failed to retrieve existing payment account', {
						userId,
						customerId,
						error: this.formatErrorMessage(updateError)
					});
				}
			}

			this.logger.error('Failed to synchronize PaymentAccount in database', {
				userId,
				customerId,
				error: this.formatErrorMessage(error)
			});

			this.reportSynchronizationFailure(userId, customerId, error);
		}
	}

	private formatErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			// Check if it's a Polar API error with validation details
			const errorMessage = error.message;
			
			// Check for payment setup errors
			if (errorMessage.includes('Payments are currently unavailable') || 
			    errorMessage.includes('needs to complete their payment setup') ||
			    errorMessage.includes('payment setup') ||
			    errorMessage.includes('complete their payment')) {
				return 'Polar payment setup incomplete: The organization needs to complete payment configuration in the Polar dashboard before payments can be processed. Please contact the administrator or complete the payment setup in your Polar dashboard.';
			}
			
			// Try to parse Polar API error response
			try {
				// Check if error message contains JSON
				if (errorMessage.includes('{') || errorMessage.includes('detail')) {
					// Try to extract meaningful error from Polar API response
					const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
					if (jsonMatch) {
						const errorData = JSON.parse(jsonMatch[0]);
						
						// Handle Polar validation errors
						if (errorData.detail && Array.isArray(errorData.detail)) {
							const emailError = errorData.detail.find((err: any) => 
								err.loc && Array.isArray(err.loc) && err.loc.includes('email')
							);
							
							if (emailError) {
								// Check if it's an invalid email domain error
								if (emailError.msg && emailError.msg.includes('does not accept email')) {
									return `Invalid email address: ${emailError.input}. Polar requires a valid email address with a real domain. Test domains like 'example.com' are not accepted. Please use a real email address.`;
								}
								return emailError.msg || errorMessage;
							}
							
							// Return first error message
							const firstError = errorData.detail[0];
							if (firstError && firstError.msg) {
								// Check for payment setup errors in parsed response
								if (firstError.msg.includes('Payments are currently unavailable') || 
								    firstError.msg.includes('needs to complete their payment setup')) {
									return 'Polar payment setup incomplete: The organization needs to complete payment configuration in the Polar dashboard before payments can be processed. Please contact the administrator or complete the payment setup in your Polar dashboard.';
								}
								return firstError.msg;
							}
						}
						
						// Check for payment setup errors in error message field
						if (errorData.message && (
							errorData.message.includes('Payments are currently unavailable') || 
							errorData.message.includes('needs to complete their payment setup')
						)) {
							return 'Polar payment setup incomplete: The organization needs to complete payment configuration in the Polar dashboard before payments can be processed. Please contact the administrator or complete the payment setup in your Polar dashboard.';
						}
					}
				}
			} catch (parseError) {
				// If parsing fails, return original message
			}
			
			return errorMessage;
		}
		if (typeof error === 'string') {
			// Check for payment setup errors in string errors
			if (error.includes('Payments are currently unavailable') || 
			    error.includes('needs to complete their payment setup')) {
				return 'Polar payment setup incomplete: The organization needs to complete payment configuration in the Polar dashboard before payments can be processed. Please contact the administrator or complete the payment setup in your Polar dashboard.';
			}
			return error;
		}
		return 'Unknown error';
	}

	private reportSynchronizationFailure(userId: string, customerId: string, error: unknown): void {
		this.logger.warn('Synchronization failure reported', {
			userId,
			customerId,
			error: this.formatErrorMessage(error),
			timestamp: new Date().toISOString()
		});
	}

	private get logger() {
		return {
			info: (message: string, context?: Record<string, any>) =>
				console.log(`[PolarProvider] ${message}`, context || ''),
			warn: (message: string, context?: Record<string, any>) =>
				console.warn(`[PolarProvider] ${message}`, context || ''),
			error: (message: string, context?: Record<string, any>) =>
				console.error(`[PolarProvider] ${message}`, context || ''),
			debug: (message: string, context?: Record<string, any>) =>
				console.log(`[PolarProvider] ${message}`, context || '')
		};
	}

	async createSetupIntent(user: User | null): Promise<SetupIntent> {
		// Polar doesn't have a direct setup intent equivalent
		// Return a mock setup intent for compatibility
		return {
			id: 'polar_setup_' + Date.now(),
			client_secret: '',
			status: 'requires_payment_method',
			payment_method_types: ['card']
		} as SetupIntent;
	}

	async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
		try {
			const { amount, currency, metadata, customerId, productId } = params;

			if (!productId) {
				throw new Error('Product ID is required for payment intent');
			}

			// Sanitize metadata to remove undefined values
			const sanitizedMetadata = metadata ? this.sanitizeMetadata(metadata) : {};

			// Create a checkout link for Polar
			// Polar expects 'products' as an array, not 'productId'
			const checkout = await this.polar.checkouts.create({
				products: [productId], // Polar requires products as an array
				organizationId: this.organizationId!,
				amount: Math.round(amount * 100), // Convert to cents
				currency: currency.toUpperCase(),
				successUrl: params.successUrl || `${this.appUrl}/pricing/success`,
				customerId: customerId,
				metadata: sanitizedMetadata
			} as any);

			return {
				id: checkout.id || '',
				amount: amount,
				currency: currency,
				status: 'requires_payment_method',
				clientSecret: (checkout as any).clientSecret || undefined,
				customerId: customerId
			};
		} catch (error) {
			this.logger.error('Failed to create Polar payment intent', {
				error: this.formatErrorMessage(error),
				params
			});
			throw new Error(`Failed to create payment intent: ${this.formatErrorMessage(error)}`);
		}
	}

	async confirmPayment(paymentId: string, paymentMethodId: string): Promise<PaymentIntent> {
		// Polar handles payment confirmation through webhooks
		// This method is kept for interface compatibility
		try {
			const payment = await this.polar.payments.get({ id: paymentId } as any);
			
			return {
				id: payment.id || paymentId,
				amount: ((payment as any).amount || 0) / 100, // Convert from cents
				currency: ((payment as any).currency || 'usd').toLowerCase(),
				status: (payment as any).status || 'succeeded',
				customerId: (payment as any).customerId
			};
		} catch (error) {
			this.logger.error('Failed to confirm Polar payment', {
				error: this.formatErrorMessage(error),
				paymentId
			});
			throw new Error(`Failed to confirm payment: ${this.formatErrorMessage(error)}`);
		}
	}

	async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
		try {
			const payment = await this.polar.payments.get({ id: paymentId } as any);
			const status = (payment as any).status || 'unknown';

			return {
				isValid: status === 'succeeded',
				paymentId: (payment as any).id || paymentId,
				status: status,
				details: payment
			};
		} catch (error) {
			this.logger.error('Failed to verify Polar payment', {
				error: this.formatErrorMessage(error),
				paymentId
			});
			return {
				isValid: false,
				paymentId,
				status: 'error',
				details: { error: this.formatErrorMessage(error) }
			};
		}
	}

	async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
		try {
			// Validate email format before sending to Polar
			if (!params.email || !this.isValidEmail(params.email)) {
				throw new Error(`Invalid email address: ${params.email}. Please provide a valid email address.`);
			}
			
			// Check for test domains that Polar rejects
			const testDomains = ['example.com', 'test.com', 'invalid.com'];
			const emailDomain = params.email.split('@')[1]?.toLowerCase();
			if (emailDomain && testDomains.includes(emailDomain)) {
				throw new Error(`Email domain '${emailDomain}' is not accepted by Polar. Please use a real email address with a valid domain.`);
			}
			
			// Sanitize metadata to remove undefined values
			const sanitizedMetadata = params.metadata ? this.sanitizeMetadata(params.metadata) : {};
			
			const customer = await this.polar.customers.create({
				email: params.email,
				name: params.name,
				metadata: sanitizedMetadata
			} as any);

			return {
				id: (customer as any).id || '',
				email: (customer as any).email || params.email,
				name: (customer as any).name || params.name,
				metadata: (customer as any).metadata || params.metadata || {}
			};
		} catch (error) {
			const errorMessage = this.formatErrorMessage(error);
			this.logger.error('Failed to create Polar customer', {
				error: errorMessage,
				email: params.email,
				hasName: !!params.name
			});
			throw new Error(`Failed to create customer: ${errorMessage}`);
		}
	}

	/**
	 * Basic email validation
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionInfo> {
		try {
			const { customerId, priceId, metadata } = params;

			if (!priceId) {
				throw new Error('Product ID is required for subscription');
			}

			// Sanitize metadata to remove undefined values
			const sanitizedMetadata = metadata ? this.sanitizeMetadata(metadata) : {};

			// Create a checkout for subscription
			// Polar expects 'products' as an array, not 'productId'
			const checkout = await this.polar.checkouts.create({
				products: [priceId], // Polar requires products as an array
				organizationId: this.organizationId!,
				customerId: customerId,
				successUrl: metadata?.successUrl || `${this.appUrl}/pricing/success`,
				cancelUrl: metadata?.cancelUrl || `${this.appUrl}/pricing`,
				metadata: sanitizedMetadata
			} as any);

			// Get subscription from checkout if available
			const subscriptionId = (checkout as any).subscriptionId;
			let subscription: any = null;
			if (subscriptionId) {
				try {
					subscription = await this.polar.subscriptions.get({ id: subscriptionId } as any);
				} catch (err) {
					this.logger.warn('Could not fetch subscription after checkout creation', { subscriptionId });
				}
			}

			return {
				id: (subscription as any)?.id || (checkout as any).id || '',
				customerId: customerId,
				status: this.mapSubscriptionStatus((subscription as any)?.status || 'incomplete'),
				currentPeriodEnd: (subscription as any)?.currentPeriodEnd ? new Date((subscription as any).currentPeriodEnd).getTime() / 1000 : undefined,
				cancelAtPeriodEnd: (subscription as any)?.cancelAtPeriodEnd || false,
				priceId: priceId,
				checkoutData: {
					checkoutId: (checkout as any).id,
					url: (checkout as any).url
				}
			};
		} catch (error) {
			this.logger.error('Failed to create Polar subscription', {
				error: this.formatErrorMessage(error),
				params
			});
			throw new Error(`Failed to create subscription: ${this.formatErrorMessage(error)}`);
		}
	}

	async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<SubscriptionInfo> {
		try {
			// Note: Adjust API call based on actual Polar SDK documentation
			const subscription = await (this.polar.subscriptions as any).cancel({
				id: subscriptionId,
				cancelAtPeriodEnd: cancelAtPeriodEnd
			} as any);

			return {
				id: (subscription as any).id || subscriptionId,
				customerId: (subscription as any).customerId || '',
				status: this.mapSubscriptionStatus((subscription as any).status || 'canceled'),
				currentPeriodEnd: (subscription as any).currentPeriodEnd ? new Date((subscription as any).currentPeriodEnd).getTime() / 1000 : undefined,
				cancelAtPeriodEnd: (subscription as any).cancelAtPeriodEnd || false,
				priceId: (subscription as any).priceId || ''
			};
		} catch (error) {
			this.logger.error('Failed to cancel Polar subscription', {
				error: this.formatErrorMessage(error),
				subscriptionId
			});
			throw new Error(`Failed to cancel subscription: ${this.formatErrorMessage(error)}`);
		}
	}

	async updateSubscription(params: UpdateSubscriptionParams): Promise<SubscriptionInfo> {
		try {
			const { subscriptionId, priceId, cancelAtPeriodEnd, metadata } = params;

			const updateData: any = {};
			if (priceId) {
				updateData.priceId = priceId;
			}
			if (cancelAtPeriodEnd !== undefined) {
				updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;
			}
			if (metadata) {
				updateData.metadata = metadata;
			}

			const subscription = await this.polar.subscriptions.update({
				id: subscriptionId,
				...updateData
			} as any);

			return {
				id: (subscription as any).id || subscriptionId,
				customerId: (subscription as any).customerId || '',
				status: this.mapSubscriptionStatus((subscription as any).status || 'active'),
				currentPeriodEnd: (subscription as any).currentPeriodEnd ? new Date((subscription as any).currentPeriodEnd).getTime() / 1000 : undefined,
				cancelAtPeriodEnd: (subscription as any).cancelAtPeriodEnd || false,
				priceId: (subscription as any).priceId || priceId || ''
			};
		} catch (error) {
			this.logger.error('Failed to update Polar subscription', {
				error: this.formatErrorMessage(error),
				params
			});
			throw new Error(`Failed to update subscription: ${this.formatErrorMessage(error)}`);
		}
	}

	async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
		try {
			// Verify webhook signature
			// Polar uses HMAC SHA256 for webhook verification
			const crypto = await import('crypto');
			const expectedSignature = crypto
				.createHmac('sha256', this.webhookSecret)
				.update(JSON.stringify(payload))
				.digest('hex');

			if (signature !== expectedSignature) {
				throw new Error('Invalid webhook signature');
			}

			const event = payload;
			let eventType: string;
			let eventData: any = {};

			// Map Polar event types to generic types
			switch (event.type) {
				case 'checkout.succeeded':
					eventType = 'payment_succeeded';
					eventData = event.data;
					break;
				case 'checkout.failed':
					eventType = 'payment_failed';
					eventData = event.data;
					break;
				case 'subscription.created':
					eventType = 'subscription_created';
					eventData = event.data;
					break;
				case 'subscription.updated':
					eventType = 'subscription_updated';
					eventData = event.data;
					break;
				case 'subscription.canceled':
					eventType = 'subscription_cancelled';
					eventData = event.data;
					break;
				case 'invoice.paid':
					eventType = 'subscription_payment_succeeded';
					eventData = event.data;
					break;
				case 'invoice.payment_failed':
					eventType = 'subscription_payment_failed';
					eventData = event.data;
					break;
				default:
					eventType = event.type;
					eventData = event.data;
			}

			return {
				received: true,
				type: eventType,
				id: event.id || event.data?.id || '',
				data: eventData
			};
		} catch (error) {
			this.logger.error('Polar webhook handling error', {
				error: this.formatErrorMessage(error)
			});
			throw error;
		}
	}

	async refundPayment(paymentId: string, amount?: number): Promise<any> {
		try {
			// Note: Adjust API call based on actual Polar SDK documentation
			const refund = await (this.polar.payments as any).refund({
				id: paymentId,
				amount: amount ? Math.round(amount * 100) : undefined // Convert to cents
			} as any);

			return {
				id: (refund as any).id || '',
				amount: ((refund as any).amount || 0) / 100, // Convert from cents
				status: (refund as any).status || 'succeeded'
			};
		} catch (error) {
			this.logger.error('Failed to refund Polar payment', {
				error: this.formatErrorMessage(error),
				paymentId
			});
			throw new Error(`Failed to refund payment: ${this.formatErrorMessage(error)}`);
		}
	}

	/**
	 * Create a customer portal session for managing subscriptions and billing.
	 * 
	 * This method creates a pre-authenticated session that allows customers to access
	 * their Polar portal to manage subscriptions, payment methods, and billing history.
	 * 
	 * @param customerId - Polar customer ID (required)
	 * @param returnUrl - Optional absolute URL to redirect after portal session ends
	 * @returns Promise resolving to session object with `id` and `url` properties
	 * @throws {Error} If customer ID is invalid, API key is missing, or session creation fails
	 * 
	 * @example
	 * ```typescript
	 * const session = await provider.createCustomerPortalSession(
	 *   'cus_123',
	 *   'https://example.com/settings/billing'
	 * );
	 * // Redirect user to session.url
	 * ```
	 */
	async createCustomerPortalSession(
		customerId: string,
		returnUrl?: string
	): Promise<{ url: string; id: string }> {
		this.validateCustomerPortalSessionInputs(customerId);

		const normalizedReturnUrl = this.normalizeReturnUrl(returnUrl);
		const apiUrl = this.getPolarApiUrl();

		// Primary approach: REST API (more reliable, better error handling)
		const restApiResult = await this.createPortalSessionViaRestApi(
			customerId,
			normalizedReturnUrl,
			apiUrl
		);
		if (restApiResult) {
			return restApiResult;
		}

		// Fallback approach: SDK (if REST API fails)
		const sdkResult = await this.createPortalSessionViaSdk(
			customerId,
			normalizedReturnUrl
		);
		if (sdkResult) {
			return sdkResult;
		}

		// Both approaches failed
		throw new Error(
			'Failed to create customer portal session: All methods exhausted. ' +
			'Please verify your Polar API configuration and customer ID.'
		);
	}

	/**
	 * Validates inputs for customer portal session creation
	 */
	private validateCustomerPortalSessionInputs(customerId: string): void {
		if (!customerId || typeof customerId !== 'string' || customerId.trim().length === 0) {
			throw new Error('Customer ID is required and must be a non-empty string');
		}

		if (!this.apiKey) {
			throw new Error('Polar API key is not configured. Please set POLAR_ACCESS_TOKEN environment variable.');
		}
	}

	/**
	 * Normalizes and validates the return URL
	 * Prevents open-redirect vulnerabilities by rejecting all absolute URLs
	 * and only allowing relative paths that are resolved against this.appUrl
	 * Removes encoding artifacts, ensures absolute URL format
	 * Uses safe string methods to avoid ReDoS vulnerabilities
	 */
	private normalizeReturnUrl(returnUrl?: string): string {
		// Default to relative path (will be resolved against this.appUrl)
		const defaultPath = '/settings/billing';
		let url = returnUrl ?? defaultPath;

		// Remove encoding artifacts (quotes, escaped characters)
		// Use safe string methods instead of regex to prevent ReDoS attacks
		url = url.trim();
		
		// Remove surrounding quotes (safe, bounded operations)
		// Only remove one layer of quotes to avoid DoS on nested quotes
		if ((url.startsWith('"') && url.endsWith('"')) || 
		    (url.startsWith("'") && url.endsWith("'"))) {
			url = url.slice(1, -1).trim();
		}
		
		// Remove escaped quotes using simple string operations
		// Split and join is safer than regex for escaping
		url = url.split('\\"').join('').split("\\'").join('');

		// Security: Reject all absolute URLs to prevent open-redirect attacks
		// If an absolute URL is provided, immediately fall back to default path
		if (url.startsWith('http://') || url.startsWith('https://')) {
			// Absolute URL detected - reject and use default path
			// This prevents open-redirect attacks even if the URL appears to be from the same origin
			this.logger.warn('Absolute return URL rejected, using default path', {
				rejectedUrl: url,
				fallbackPath: defaultPath
			});
			url = defaultPath;
		}

		// Build absolute URL from relative path
		// Handle leading slash properly
		const relativePath = url.startsWith('/') ? url : `/${url}`;
		const absoluteUrl = `${this.appUrl}${relativePath}`;

		// Validate the constructed URL format
		if (!this.appUrl) {
			throw new Error('App URL is not configured. Cannot construct return URL.');
		}

		try {
			const validatedUrl = new URL(absoluteUrl);
			const appUrlObj = new URL(this.appUrl);
			
			// Double-check that the origin matches (defense in depth)
			if (validatedUrl.origin !== appUrlObj.origin) {
				throw new Error('URL origin mismatch');
			}
			
			return absoluteUrl;
		} catch (error) {
			if (error instanceof Error && error.message === 'URL origin mismatch') {
				throw error;
			}
			throw new Error(`Invalid return URL format: ${absoluteUrl}. Must be a valid absolute URL from the same origin.`);
		}
	}

	/**
	 * Gets the Polar API base URL from environment or defaults
	 */
	private getPolarApiUrl(): string {
		return process.env.POLAR_API_URL || 'https://api.polar.sh';
	}

	/**
	 * Creates portal session using Polar REST API directly
	 * This is the preferred method as it avoids SDK serialization issues
	 */
	private async createPortalSessionViaRestApi(
		customerId: string,
		returnUrl: string,
		apiUrl: string
	): Promise<{ url: string; id: string } | null> {
		try {
			const requestBody = this.buildRestApiRequestBody(customerId, returnUrl);

			this.logger.info('Creating Polar customer portal session via REST API', {
				endpoint: `${apiUrl}/v1/customer-sessions`,
				customerId,
				hasReturnUrl: !!requestBody.return_url
			});

			const response = await fetch(`${apiUrl}/v1/customer-sessions`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				// handleRestApiError throws for fatal errors (401, 403, 404, 400, 429)
				// and returns true for recoverable errors (allowing fallback)
				const shouldFallback = await this.handleRestApiError(response, customerId);
				// If we reach here, it's a recoverable error - allow fallback
				return null;
			}

			const session = await response.json();
			const portalSession = this.extractPortalSessionFromResponse(session);

			if (portalSession) {
				this.logger.info('Polar customer portal session created successfully via REST API', {
					sessionId: portalSession.id,
					customerId
				});
				return portalSession;
			}

			this.logger.warn('REST API response missing portal URL', {
				responseKeys: Object.keys(session),
				customerId
			});
			return null;

		} catch (error) {
			// Check if this is a fatal error (PolarFatalError)
			// Fatal errors should be propagated immediately, not caught
			if (error instanceof PolarFatalError) {
				// This is a fatal error - propagate it to the caller
				throw error;
			}
			
			// Otherwise, it's a recoverable error (network, etc.) - allow fallback
			const errorMsg = this.formatErrorMessage(error);
			this.logger.warn('REST API portal session creation failed, attempting SDK fallback', {
				error: errorMsg,
				customerId
			});
			return null;
		}
	}

	/**
	 * Builds request body for REST API call
	 */
	private buildRestApiRequestBody(
		customerId: string,
		returnUrl: string
	): { customer_id: string; return_url?: string } {
		const body: { customer_id: string; return_url?: string } = {
			customer_id: customerId
		};

		// Only include return_url if it's a valid absolute URL
		if (returnUrl && (returnUrl.startsWith('http://') || returnUrl.startsWith('https://'))) {
			body.return_url = returnUrl;
		}

		return body;
	}

	/**
	 * Handles REST API error responses with appropriate error messages
	 * @returns false if error is fatal (should throw), true if recoverable (allow fallback)
	 * @throws Error for fatal errors (401, 403, 404, 400, 429, 5xx)
	 */
	private async handleRestApiError(
		response: Response,
		customerId: string
	): Promise<boolean> {
		const errorText = await response.text().catch(() => 'Unable to read error response');

		this.logger.error('Polar REST API customer-sessions request failed', {
			status: response.status,
			statusText: response.statusText,
			error: errorText,
			customerId
		});

		// Map HTTP status codes to specific error messages
		// Fatal errors (client errors and rate limits) should be thrown immediately
		switch (response.status) {
			case 404:
				throw new PolarFatalError(`Customer not found: ${customerId}. Please verify the customer exists in Polar.`);
			case 401:
			case 403:
				throw new PolarFatalError(
					'Polar API authentication failed. Please verify your POLAR_ACCESS_TOKEN is correct and has the required permissions.'
				);
			case 400:
				throw new PolarFatalError(
					`Invalid request to Polar API: ${errorText}. Please check your customer ID and return URL format.`
				);
			case 429:
				throw new PolarFatalError('Polar API rate limit exceeded. Please try again later.');
			case 500:
			case 502:
			case 503:
				// Server errors are recoverable - allow fallback to SDK
				this.logger.warn('Polar API server error, will attempt SDK fallback', {
					status: response.status,
					customerId
				});
				return true; // Allow fallback
			default:
				// Unknown errors - allow fallback to SDK
				this.logger.warn('Polar API unknown error, will attempt SDK fallback', {
					status: response.status,
					customerId
				});
				return true; // Allow fallback
		}
	}

	/**
	 * Extracts portal session data from API response
	 * Handles various response formats from Polar API
	 */
	private extractPortalSessionFromResponse(
		session: any
	): { url: string; id: string } | null {
		// Try multiple possible field names for portal URL
		const portalUrlFields = [
			'customer_portal_url', // Primary field (snake_case)
			'customerPortalUrl',  // camelCase variant
			'portal_url',
			'portalUrl',
			'url'
		];

		const sessionUrl = portalUrlFields
			.map(field => session[field])
			.find(url => url && typeof url === 'string' && url.length > 0);

		if (!sessionUrl) {
			return null;
		}

		const sessionId = session.id || session.session_id || `cs_${Date.now()}`;

		return {
			id: sessionId,
			url: sessionUrl
		};
	}

	/**
	 * Creates portal session using Polar SDK (fallback method)
	 */
	private async createPortalSessionViaSdk(
		customerId: string,
		returnUrl: string
	): Promise<{ url: string; id: string } | null> {
		if (!this.isSdkCustomerSessionsAvailable()) {
			this.logger.debug('Polar SDK customerSessions not available, skipping SDK approach');
			return null;
		}

		try {
			const sessionParams = this.buildSdkSessionParams(customerId, returnUrl);

			this.logger.info('Creating Polar customer portal session via SDK (fallback)', {
				customerId,
				hasReturnUrl: !!sessionParams.returnUrl
			});

			const session = await (this.polar.customerSessions as any).create(sessionParams);
			const portalSession = this.extractPortalSessionFromResponse(session);

			if (portalSession) {
				this.logger.info('Polar customer portal session created successfully via SDK', {
					sessionId: portalSession.id,
					customerId
				});
				return portalSession;
			}

			this.logger.warn('SDK response missing portal URL', {
				responseKeys: Object.keys(session || {}),
				customerId
			});
			return null;

		} catch (error) {
			const errorMsg = this.formatErrorMessage(error);
			this.logger.error('Polar SDK customerSessions.create failed', {
				error: errorMsg,
				customerId,
				errorType: error instanceof Error ? error.constructor.name : typeof error,
				...(error instanceof Error && {
					stack: error.stack,
					message: error.message
				})
			});
			return null;
		}
	}

	/**
	 * Checks if SDK customerSessions API is available
	 */
	private isSdkCustomerSessionsAvailable(): boolean {
		return !!(
			this.polar.customerSessions &&
			typeof (this.polar.customerSessions as any).create === 'function'
		);
	}

	/**
	 * Builds parameters for SDK customerSessions.create call
	 */
	private buildSdkSessionParams(
		customerId: string,
		returnUrl: string
	): { customerId: string; returnUrl?: string } {
		const params: { customerId: string; returnUrl?: string } = {
			customerId
		};

		// Only include returnUrl if it's a valid absolute URL
		if (returnUrl && (returnUrl.startsWith('http://') || returnUrl.startsWith('https://'))) {
			params.returnUrl = returnUrl;
		}

		return params;
	}

	getClientConfig(): ClientConfig {
		return {
			publicKey: this.organizationId || '',
			paymentGateway: 'polar',
			options: {
				organizationId: this.organizationId,
				appUrl: this.appUrl
			}
		};
	}

	getUIComponents(): UIComponents {
		return {
			PaymentForm: this.getPaymentFormComponent(),
			logo: '/assets/payment/polar/logo.svg',
			cardBrands: polarCardBrands,
			supportedPaymentMethods: ['card'],
			translations: polarTranslations
		};
	}

	private mapSubscriptionStatus(status: string): SubscriptionStatus {
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

	private getPaymentFormComponent(): React.ComponentType<PaymentFormProps> {
		// Return a simple payment form component
		// In a real implementation, this would use Polar's checkout embed
		const PolarPaymentForm = ({ onSuccess, onError, amount, currency }: PaymentFormProps) => {
			return React.createElement(
				'div',
				{ className: 'polar-payment-form' },
				React.createElement('p', null, 'Polar payment form - redirect to checkout'),
				React.createElement(
					'button',
					{
						onClick: () => {
							// In real implementation, redirect to Polar checkout
							onSuccess('polar_checkout_' + Date.now());
						}
					},
					'Proceed to Payment'
				)
			);
		};
		return PolarPaymentForm;
	}
}

