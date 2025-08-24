import { LemonSqueezyProvider, StripeProvider } from '..';

// Centralized configuration for all providers
interface ProviderConfig {
	stripe: {
		apiKey: string;
		webhookSecret: string;
		publishableKey: string;
		apiVersion: string;
	};
	lemonsqueezy: {
		apiKey: string;
		webhookSecret: string;
		options: {
			[key: string]: any;
		};
	};
}

// Environment variables validation and configuration
class ConfigManager {
	private static config: ProviderConfig | null = null;
	private static initializedProviders: Set<string> = new Set();

	private static ensureConfig(): ProviderConfig {
		if (!this.config) {
			this.config = {
				stripe: {
					apiKey: process.env.STRIPE_SECRET_KEY || '',
					webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
					publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
					apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16'
				},
				lemonsqueezy: {
					apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
					webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
					options: {
						storeId: process.env.LEMONSQUEEZY_STORE_ID || '',
						testMode: process.env.LEMONSQUEEZY_TEST_MODE === 'true',
						apiVersion: process.env.LEMONSQUEEZY_API_VERSION || '2023-10-16',
						appUrl: process.env.NEXT_PUBLIC_APP_URL || ''
					}
				}
			};
			console.log('✅ ConfigManager initialized with default values');
		}
		return this.config;
	}

	public static getConfig(): ProviderConfig {
		return this.ensureConfig();
	}

	public static getStripeConfig() {
		if (!this.initializedProviders.has('stripe')) {
			this.validateStripeConfig();
			this.initializedProviders.add('stripe');
		}
		return this.ensureConfig().stripe;
	}

	public static getLemonsqueezyConfig() {
		if (!this.initializedProviders.has('lemonsqueezy')) {
			this.validateLemonsqueezyConfig();
			this.initializedProviders.add('lemonsqueezy');
		}
		return this.ensureConfig().lemonsqueezy;
	}

	private static validateStripeConfig(): void {
		const stripeApiKey = process.env.STRIPE_SECRET_KEY;
		const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
		const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
		const stripeApiVersion = process.env.STRIPE_API_VERSION || '2023-10-16';

		if (!stripeApiKey || !stripeWebhookSecret || !stripePublishableKey) {
			throw new Error(
				'Stripe configuration is incomplete. Required: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
			);
		}

		// Set validated Stripe configuration
		this.ensureConfig().stripe = {
			apiKey: stripeApiKey,
			webhookSecret: stripeWebhookSecret,
			publishableKey: stripePublishableKey,
			apiVersion: stripeApiVersion
		};

		console.log('✅ Stripe configuration validated successfully');
	}

	private static validateLemonsqueezyConfig(): void {
		const lemonsqueezyApiKey = process.env.LEMONSQUEEZY_API_KEY;
		const lemonsqueezyStoreId = process.env.LEMONSQUEEZY_STORE_ID;
		const lemonsqueezyTestMode = process.env.LEMONSQUEEZY_TEST_MODE === 'true';
		const lemonsqueezyWebhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
		const lemonsqueezyApiVersion = process.env.LEMONSQUEEZY_API_VERSION || '2023-10-16';
		const lemonsqueezyAppUrl = process.env.NEXT_PUBLIC_APP_URL || '';

		if (!lemonsqueezyApiKey) {
			throw new Error('Lemonsqueezy configuration is incomplete. Required: LEMONSQUEEZY_API_KEY');
		}

		this.ensureConfig().lemonsqueezy = {
			apiKey: lemonsqueezyApiKey,
			webhookSecret: lemonsqueezyWebhookSecret || '',
			options: {
				storeId: lemonsqueezyStoreId || '',
				testMode: lemonsqueezyTestMode,
				apiVersion: lemonsqueezyApiVersion,
				appUrl: lemonsqueezyAppUrl
			}
		};

		console.log('✅ LemonSqueezy configuration validated successfully');
	}
}

export class PaymentProviderManager {
	private static instances = new Map<string, any>();
	private static isInitializing = new Map<string, boolean>();

	private constructor() {}

	public static getProvider<T>(providerName: string, config: any, ProviderClass: new (config: any) => T): T {
		if (!this.instances.has(providerName) && !this.isInitializing.get(providerName)) {
			this.isInitializing.set(providerName, true);

			try {
				const instance = new ProviderClass(config);
				this.instances.set(providerName, instance);
				this.isInitializing.set(providerName, false);
				return instance;
			} catch (error) {
				this.isInitializing.set(providerName, false);
				throw new Error(
					`Failed to initialize ${providerName} provider: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
			}
		}

		const instance = this.instances.get(providerName);
		if (!instance) {
			throw new Error(`Failed to initialize ${providerName} provider`);
		}

		return instance;
	}

	public static getStripeProvider(): StripeProvider {
		const stripeConfig = ConfigManager.getStripeConfig();
		return this.getProvider('stripe', stripeConfig, StripeProvider);
	}

	public static getLemonsqueezyProvider(): LemonSqueezyProvider {
		const lemonsqueezyConfig = ConfigManager.getLemonsqueezyConfig();
		return this.getProvider('lemonsqueezy', lemonsqueezyConfig, LemonSqueezyProvider);
	}

	public static reset(): void {
		this.instances.clear();
		this.isInitializing.clear();
	}

	public static isInitialized(providerName: string): boolean {
		return this.instances.has(providerName);
	}
}

export function initializeStripeProvider(): StripeProvider {
	return PaymentProviderManager.getStripeProvider();
}

export function initializeLemonsqueezyProvider(): LemonSqueezyProvider {
	return PaymentProviderManager.getLemonsqueezyProvider();
}

export function getStripeProvider(): StripeProvider | null {
	return PaymentProviderManager.isInitialized('stripe') ? PaymentProviderManager.getStripeProvider() : null;
}

export function getLemonsqueezyProvider(): LemonSqueezyProvider | null {
	return PaymentProviderManager.isInitialized('lemonsqueezy')
		? PaymentProviderManager.getLemonsqueezyProvider()
		: null;
}

export function resetPaymentProviders(): void {
	PaymentProviderManager.reset();
}

export function getOrCreateStripeProvider(): StripeProvider {
	return getStripeProvider() || initializeStripeProvider();
}

export function getOrCreateLemonsqueezyProvider(): LemonSqueezyProvider {
	return getLemonsqueezyProvider() || initializeLemonsqueezyProvider();
}
