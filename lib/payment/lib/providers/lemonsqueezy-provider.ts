import { User } from '@supabase/auth-js';
import * as crypto from 'crypto';
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
	UpdateSubscriptionParams,
	SubscriptionInfo,
	SetupIntent,
	UIComponents,
	CheckoutParams,
	SubscriptionStatus
} from '../../types/payment-types';
import {
	createCheckout,
	createCustomer,
	getOrder,
	cancelSubscription,
	updateSubscription,
	lemonSqueezySetup
} from '@lemonsqueezy/lemonsqueezy.js';

import { env } from '@/lib/config/env';
import { paymentAccountClient } from '../client/payment-account-client';

export interface LemonSqueezyConfig extends PaymentProviderConfig {
	apiKey: string;
	webhookSecret: string;
	options?: {
		storeId?: string;
		testMode?: boolean;
	};
}

export class LemonSqueezyProvider implements PaymentProviderInterface {
	private apiKey: string;
	private webhookSecret: string;
	private storeId?: string;
	private testMode: boolean;

	constructor(config: LemonSqueezyConfig) {
		this.apiKey = config.apiKey;
		this.webhookSecret = config.webhookSecret;
		this.storeId = config.options?.storeId;
		this.testMode = config.options?.testMode || false;
		lemonSqueezySetup({ apiKey: this.apiKey });
	}

	hasCustomerId(user: User | null): boolean {
		return !!user?.user_metadata?.lemonsqueezy_customer_id;
	}

	private isValidUser(user: User | null): user is User {
		return user !== null && typeof user.id === 'string' && user.id.length > 0;
	}

	private extractCustomerIdFromMetadata(user: User): string | null {
		if (!this.hasCustomerId(user)) {
			return null;
		}

		const customerId = user.user_metadata?.customerId;
		return typeof customerId === 'string' && customerId.length > 0 ? customerId : null;
	}

	async getCustomerId(user: User | null): Promise<string | null> {
		const userId = user?.id;
		if (!this.isValidUser(user)) {
			this.logger.warn('getCustomerId: Invalid or disconnected user', { userId: userId || 'undefined' });
			return null;
		}
		const validatedUserId = user?.id;
		this.logger.info('Starting LemonSqueezy customer retrieval/creation', { userId: validatedUserId });

		try {
			const customerIdFromMetadata = this.extractCustomerIdFromMetadata(user);
			if (customerIdFromMetadata) {
				this.logger.info('LemonSqueezy customer retrieved from metadata', {
					userId: validatedUserId,
					customerId: customerIdFromMetadata
				});
				return customerIdFromMetadata;
			}
			const customerIdFromDatabase = await this.retrieveCustomerIdFromDatabase(validatedUserId);
			if (customerIdFromDatabase) {
				this.logger.info('LemonSqueezy customer retrieved from database', {
					userId: validatedUserId,
					customerId: customerIdFromDatabase
				});
				return customerIdFromDatabase;
			}
			this.logger.info('Creating new LemonSqueezy customer', { userId: validatedUserId });
			const newCustomer = await this.createNewLemonSqueezyCustomer(user);
			await this.synchronizePaymentAccount(validatedUserId, newCustomer.id);

			this.logger.info('New LemonSqueezy customer created successfully', {
				userId: validatedUserId,
				customerId: newCustomer.id
			});
			return newCustomer.id;
		} catch (error) {
			const errorMessage = this.formatErrorMessage(error);
			this.logger.error('Failed to retrieve/create LemonSqueezy customer', {
				userId: validatedUserId,
				error: errorMessage
			});
			throw new Error(`Unable to retrieve/create LemonSqueezy customer: ${errorMessage}`);
		}
	}

	private async retrieveCustomerIdFromDatabase(userId: string): Promise<string | null> {
		try {
			const existingPaymentAccount = await paymentAccountClient.getPaymentAccount(userId, 'lemonsqueezy');

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

	async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
		try {
			const { data, error } = await createCustomer(Number(this.storeId), {
				email: params.email,
				name: params.name || '',
				city: params.metadata?.city || '',
				region: params.metadata?.region || '',
				country: params.metadata?.country || ''
			});

			if (error) {
				throw new Error(`LemonSqueezy error: ${error.message}`);
			}
			return {
				id: data?.data?.id,
				email: data?.data?.attributes?.email,
				name: data?.data?.attributes?.name,
				metadata: {
					city: data?.data?.attributes?.city,
					region: data?.data?.attributes?.region,
					country: data?.data?.attributes?.country
				}
			};
		} catch (error) {
			console.error('Error creating LemonSqueezy customer:', error);
			throw new Error('Failed to create customer');
		}
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
				console.log(`[LemonSqueezyProvider] ${message}`, context || ''),
			warn: (message: string, context?: Record<string, any>) =>
				console.warn(`[LemonSqueezyProvider] ${message}`, context || ''),
			error: (message: string, context?: Record<string, any>) =>
				console.error(`[LemonSqueezyProvider] ${message}`, context || ''),
			debug: (message: string, context?: Record<string, any>) =>
				console.log(`[LemonSqueezyProvider] ${message}`, context || '')
		};
	}

	private async createNewLemonSqueezyCustomer(user: User): Promise<CustomerResult> {
		const customerData = this.buildCustomerData(user);
		try {
			const customer = await this.createCustomer(customerData);
			this.logger.debug('LemonSqueezy customer created successfully', {
				userId: user.id,
				customerId: customer.id,
				email: customer.email
			});
			return customer;
		} catch (error) {
			this.logger.error('Failed to create LemonSqueezy customer', {
				userId: user.id,
				error: this.formatErrorMessage(error),
				customerData
			});
			throw error;
		}
	}

	private buildCustomerData(user: User): CreateCustomerParams {
		return {
			email: user.email || '',
			name: user.user_metadata?.name || undefined,
			metadata: {
				userId: user.id,
				planId: user.user_metadata?.planId || undefined,
				planName: user.user_metadata?.planName || undefined,
				billingInterval: user.user_metadata?.billingInterval || undefined
			}
		};
	}

	private async synchronizePaymentAccount(userId: string, customerId: string): Promise<void> {
		try {
			const paymentAccount = await paymentAccountClient.setupPaymentAccount({
				provider: 'lemonsqueezy',
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
					const existingAccount = await paymentAccountClient.getPaymentAccount(userId, 'lemonsqueezy');
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
			return error.message;
		}
		if (typeof error === 'string') {
			return error;
		}
		return 'Unknown error';
	}

	async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
		try {
			return {
				id: '',
				amount: params.amount,
				currency: params.currency,
				status: 'requires_payment_method',
				clientSecret: '',
				customerId: params.customerId
			};
		} catch (error) {
			console.error('Error creating LemonSqueezy checkout:', error);
			throw new Error('Failed to create payment intent');
		}
	}

	async confirmPayment(paymentId: string): Promise<PaymentIntent> {
		// LemonSqueezy doesn't have a separate confirm step, return the payment intent
		return this.verifyPayment(paymentId).then((result) => {
			if (result.isValid) {
				return {
					id: paymentId,
					amount: 0,
					currency: 'usd',
					status: result.status,
					clientSecret: ''
				};
			}
			throw new Error('Payment confirmation failed');
		});
	}

	async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
		try {
			const order = await getOrder(Number(paymentId));
			return {
				isValid: true,
				paymentId: paymentId,
				status: order?.data?.data?.attributes?.status || 'failed',
				details: order?.data?.data?.attributes?.currency || 'failed'
			};
		} catch (error) {
			console.error('Error verifying LemonSqueezy payment:', error);
			return {
				isValid: false,
				paymentId: paymentId,
				status: 'failed',
				details: error
			};
		}
	}

	async createSetupIntent(): Promise<SetupIntent> {
		// LemonSqueezy doesn't use setup intents like Stripe
		// This is a placeholder implementation
		throw new Error('Setup intents not supported by LemonSqueezy');
	}

	async createCustomCheckout(params: CheckoutParams): Promise<string> {
		try {
			const { data, error } = await createCheckout(
				Number(this.storeId),
				Number(params.variantId),
				{
					customPrice: params.customPrice,
					productOptions: {
						redirectUrl: `${env.API_BASE_URL}/billing/success`
					},
					checkoutOptions: {
						embed: true,
						media: false,
						logo: false
					},
					checkoutData: {
						email: params.email,
						custom: params.metadata ?? {}
					},
					preview: false,
					testMode: process.env.NODE_ENV === 'development'
				}
			);

			if (error) {
				throw new Error(`Lemonsqueezy checkout error: ${error.message || 'Unknown error'}`);
			}

			if (!data?.data?.attributes?.url) {
				throw new Error('Invalid response from Lemonsqueezy: missing checkout URL');
			}

			return data.data.attributes.url;
		} catch (error) {
			console.error('Error creating LemonSqueezy subscription:', error);
			throw new Error('Failed to create subscription');
		}
	}

	async createSubscription(params: CheckoutParams): Promise<SubscriptionInfo> {
		try {
			const { variantId, email, customPrice, metadata } = params;

			const finalProductId = variantId ?? Number(process.env.LEMONSQUEEZY_VARIANT_ID);
			if (!finalProductId) {
				throw new Error('Product ID is required');
			}

			const { data, error } = await createCheckout(Number(this.storeId), finalProductId, {
				customPrice,
				productOptions: {
					redirectUrl: metadata?.successUrl || '',
					name: metadata?.name || 'Subscription',
					description: metadata?.description || 'Subscription checkout',
					media: []
				},
				checkoutOptions: {
					embed: true,
					media: false,
					logo: false
				},
				checkoutData: {
					email: email || '',
					custom: metadata ?? {}
				},
				preview: false,
				testMode: process.env.NODE_ENV === 'development'
			});

			if (error) {
				throw new Error(`Lemonsqueezy checkout error: ${error.message || 'Unknown error'}`);
			}

			if (!data?.data?.attributes?.url) {
				throw new Error('Invalid response from Lemonsqueezy: missing checkout URL');
			}
			return {
				id: data.data.id,
				customerId: '',
				status: 'pending' as SubscriptionStatus,
				priceId: '',
				cancelAtPeriodEnd: false,
				checkoutData: {
					...data.data.attributes,
					relationships: data.data.relationships,
					type: data.data.type,
					links: data.data.links
				}
			};
		} catch (error) {
			console.error('Error creating LemonSqueezy subscription:', error);
			throw new Error('Failed to create subscription');
		}
	}

	async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<SubscriptionInfo> {
		try {
			const { data, error } = await cancelSubscription(Number(subscriptionId));

			if (error) throw new Error(`Lemonsqueezy cancel subscription error: ${error.message || 'Unknown error'}`);
			return {
				id: subscriptionId,
				customerId: '',
				status: 'canceled' as SubscriptionStatus,
				priceId: '',
				cancelAtPeriodEnd: cancelAtPeriodEnd,
				checkoutData: {
					...data?.data?.attributes,
					relationships: data?.data?.relationships,
					type: data?.data?.type,
					links: data?.data?.links
				}
			};
		} catch (error) {
			console.error('Error cancelling LemonSqueezy subscription:', error);
			throw new Error('Failed to cancel subscription');
		}
	}

	async updateSubscription(params: UpdateSubscriptionParams): Promise<SubscriptionInfo> {
		try {
			const { data, error } = await updateSubscription(Number(params.subscriptionId), {
				variantId: params.priceId ? Number(params.priceId) : undefined,
				pause: {
					mode: 'void' as 'void' | 'free',
					resumesAt: params.cancelAtPeriodEnd ? new Date().toISOString() : undefined
				},
				cancelled: params.cancelAtPeriodEnd ? true : false,
				trialEndsAt: params.cancelAtPeriodEnd ? new Date().toISOString() : undefined,
				billingAnchor: params.cancelAtPeriodEnd ? 0 : undefined,
				invoiceImmediately: params.cancelAtPeriodEnd ? true : false,
				disableProrations: params.cancelAtPeriodEnd ? true : false
			});

			if (error) throw new Error(`Lemonsqueezy update subscription error: ${error.message || 'Unknown error'}`);

			return {
				id: params.subscriptionId,
				customerId: '',
				status: 'active' as SubscriptionStatus,
				priceId: '',
				cancelAtPeriodEnd: params.cancelAtPeriodEnd,
				checkoutData: {
					...data?.data?.attributes,
					relationships: data?.data?.relationships,
					type: data?.data?.type,
					links: data?.data?.links
				}
			};
		} catch (error) {
			console.error('Error updating LemonSqueezy subscription:', error);
			throw new Error('Failed to update subscription');
		}
	}

	async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
		try {
			const hmac = crypto.createHmac('sha256', this.webhookSecret);
			hmac.update(JSON.stringify(payload));
			const calculatedSignature = hmac.digest('hex');

			if (calculatedSignature !== signature) {
				return {
					received: false,
					type: 'verification_failed',
					id: '',
					data: { error: 'Invalid signature' }
				};
			}

			const event = payload;
			return {
				received: true,
				type: event.meta.event_name,
				id: event.data.id,
				data: event.data
			};
		} catch (error) {
			console.error('Error handling LemonSqueezy webhook:', error);
			return {
				received: false,
				type: 'processing_error',
				id: '',
				data: { error: 'Webhook processing failed' }
			};
		}
	}

	async refundPayment(): Promise<any> {
		// LemonSqueezy doesn't have a direct refund API
		// Refunds are typically handled through the dashboard
		throw new Error('Refunds must be processed through LemonSqueezy dashboard');
	}

	getClientConfig(): ClientConfig {
		return {
			publicKey: this.apiKey,
			paymentGateway: 'lemonsqueezy',
			options: {
				storeId: this.storeId,
				testMode: this.testMode
			}
		};
	}

	getUIComponents(): UIComponents {
		return {
			PaymentForm: () => null, // Placeholder component
			logo: '/logos/lemonsqueezy-logo.svg',
			cardBrands: [],
			supportedPaymentMethods: ['card', 'paypal'],
			translations: {
				en: {
					'button.pay': 'Pay with LemonSqueezy',
					'button.subscribe': 'Subscribe with LemonSqueezy'
				}
			}
		};
	}
}
