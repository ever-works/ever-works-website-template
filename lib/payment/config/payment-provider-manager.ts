import { LemonSqueezyProvider, StripeProvider, PolarProvider } from '..';
import { PaymentProviderInterface } from '../types/payment-types';

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
	solidgate?: {
		apiKey: string;
		webhookSecret: string;
		options: {
			[key: string]: any;
		};
	};
	polar: {
		apiKey: string;
		webhookSecret: string;
		options: {
			organizationId?: string;
			appUrl?: string;
			[key: string]: any;
		};
	};
}

const appUrl =
	process.env.NEXT_PUBLIC_APP_URL ??
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://demo.ever.works');

// Environment variables validation and configuration
class ConfigManager {
	private static config: ProviderConfig | null = null;
	private static initializedProviders: Set<string> = new Set();

	// Stripe configuration
	private static stripeApiKey: string = process.env.STRIPE_SECRET_KEY || '';
	private static stripeWebhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET || '';
	private static stripePublishableKey: string = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
	private static stripeApiVersion: string = process.env.STRIPE_API_VERSION || '2023-10-16';

	// LemonSqueezy configuration
	private static lemonsqueezyApiKey: string = process.env.LEMONSQUEEZY_API_KEY || '';
	private static lemonsqueezyWebhookSecret: string = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
	private static lemonsqueezyStoreId: string = process.env.LEMONSQUEEZY_STORE_ID || '';
	private static lemonsqueezyTestMode: boolean = process.env.LEMONSQUEEZY_TEST_MODE === 'true';
	private static lemonsqueezyApiVersion: string = process.env.LEMONSQUEEZY_API_VERSION || '2023-10-16';
	private static lemonsqueezyAppUrl: string = appUrl;
	private static lemonsqueezySiteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://ever.works';

	// Polar configuration
	private static polarApiKey: string = process.env.POLAR_ACCESS_TOKEN || '';
	private static polarWebhookSecret: string = process.env.POLAR_WEBHOOK_SECRET || '';
	private static polarOrganizationId: string = process.env.POLAR_ORGANIZATION_ID || '';
	private static polarAppUrl: string = appUrl;

	private static ensureConfig(): ProviderConfig {
		if (!this.config) {
			this.config = {
				stripe: {
					apiKey: this.stripeApiKey || '',
					webhookSecret: this.stripeWebhookSecret || '',
					publishableKey: this.stripePublishableKey || '',
					apiVersion: this.stripeApiVersion || '2023-10-16'
				},
				lemonsqueezy: {
					apiKey: this.lemonsqueezyApiKey || '',
					webhookSecret: this.lemonsqueezyWebhookSecret || '',
					options: {
						storeId: this.lemonsqueezyStoreId || '',
						testMode: this.lemonsqueezyTestMode,
						apiVersion: this.lemonsqueezyApiVersion,
						appUrl: this.lemonsqueezyAppUrl || '',
						siteUrl: this.lemonsqueezySiteUrl || ''
					}
				},
				polar: {
					apiKey: this.polarApiKey || '',
					webhookSecret: this.polarWebhookSecret || '',
					options: {
						organizationId: this.polarOrganizationId || '',
						appUrl: this.polarAppUrl || ''
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

	public static getPolarConfig() {
		if (!this.initializedProviders.has('polar')) {
			this.validatePolarConfig();
			this.initializedProviders.add('polar');
		}
		return this.ensureConfig().polar;
	}

	private static validateStripeConfig(): void {
		const stripeApiKey = this.stripeApiKey;
		const stripeWebhookSecret = this.stripeWebhookSecret;
		const stripePublishableKey = this.stripePublishableKey;
		const stripeApiVersion = this.stripeApiVersion;

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
		const lemonsqueezyApiKey = this.lemonsqueezyApiKey;
		const lemonsqueezyStoreId = this.lemonsqueezyStoreId;
		const lemonsqueezyTestMode = this.lemonsqueezyTestMode;
		const lemonsqueezyWebhookSecret = this.lemonsqueezyWebhookSecret;
		const lemonsqueezyApiVersion = this.lemonsqueezyApiVersion;
		const lemonsqueezyAppUrl = this.lemonsqueezyAppUrl;
		const lemonsqueezySiteUrl = this.lemonsqueezySiteUrl;

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
				appUrl: lemonsqueezyAppUrl,
				siteUrl: lemonsqueezySiteUrl
			}
		};

		console.log('✅ LemonSqueezy configuration validated successfully');
	}

	private static validatePolarConfig(): void {
		const polarApiKey = this.polarApiKey;
		const polarWebhookSecret = this.polarWebhookSecret;
		const polarOrganizationId = this.polarOrganizationId;
		const polarAppUrl = this.polarAppUrl;

		if (!polarApiKey || !polarOrganizationId) {
			throw new Error('Polar configuration is incomplete. Required: POLAR_ACCESS_TOKEN, POLAR_ORGANIZATION_ID');
		}

		this.ensureConfig().polar = {
			apiKey: polarApiKey,
			webhookSecret: polarWebhookSecret || '',
			options: {
				organizationId: polarOrganizationId,
				appUrl: polarAppUrl
			}
		};

		console.log('✅ Polar configuration validated successfully');
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

	public static getPolarProvider(): PolarProvider {
		const polarConfig = ConfigManager.getPolarConfig();
		return this.getProvider('polar', polarConfig, PolarProvider);
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

export function initializePolarProvider(): PolarProvider {
	return PaymentProviderManager.getPolarProvider();
}

export function getPolarProvider(): PolarProvider | null {
	return PaymentProviderManager.isInitialized('polar') ? PaymentProviderManager.getPolarProvider() : null;
}

export function getOrCreatePolarProvider(): PolarProvider {
	return getPolarProvider() || initializePolarProvider();
}

/**
 * Generic function to get or create a payment provider instance by provider name
 * Supports all payment providers: stripe, lemonsqueezy, polar
 * @param providerName - The name of the payment provider (e.g., 'stripe', 'lemonsqueezy', 'polar')
 * @returns The payment provider instance
 * @throws Error if the provider is not supported
 */
export function getOrCreateProvider(providerName: string): PaymentProviderInterface {
	const normalizedName = providerName.toLowerCase();

	switch (normalizedName) {
		case 'stripe':
			return getOrCreateStripeProvider();
		case 'lemonsqueezy':
			return getOrCreateLemonsqueezyProvider();
		case 'polar':
			return getOrCreatePolarProvider();
		default:
			throw new Error(`Unsupported payment provider: ${providerName}`);
	}
}
