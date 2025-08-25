/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { accounts, sessions, users, verificationTokens } from '../db/schema';
import { db } from '../db/drizzle';
import authConfig from '../../auth.config';

import { createProviderConfigs, StripeProvider } from '../payment';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

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
					apiVersion: '2023-10-16'
				},
				lemonsqueezy: {
					apiKey: process.env.LEMONSQUEEZY_API_KEY || ''
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
		// Only validate Stripe when actually requested
		if (!this.initializedProviders.has('stripe')) {
			this.validateStripeConfig();
			this.initializedProviders.add('stripe');
		}
		return this.ensureConfig().stripe;
	}

	public static getLemonsqueezyConfig() {
		// Only validate LemonSqueezy when actually requested
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
			throw new Error('Stripe configuration is incomplete. Required: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
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
		if (!lemonsqueezyApiKey) {
			throw new Error('Lemonsqueezy configuration is incomplete. Required: LEMONSQUEEZY_API_KEY');
		}

		// Set validated LemonSqueezy configuration
		this.ensureConfig().lemonsqueezy = {
			apiKey: lemonsqueezyApiKey
		};

		console.log('✅ LemonSqueezy configuration validated successfully');
	}
}

// Define proper interface for user objects with admin/client properties
interface ExtendedUser {
	id?: string;
	email?: string;
	isAdmin?: boolean;
	isClient?: boolean;
}

// Check if DATABASE_URL is set
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create the Drizzle adapter if DATABASE_URL is available
const drizzle = isDatabaseAvailable
	? DrizzleAdapter(db, {
			usersTable: users as any,
			accountsTable: accounts as any,
			sessionsTable: sessions as any,
			verificationTokensTable: verificationTokens as any
		})
	: undefined;

/**
 * Stripe Provider Singleton
 * Ensures single instance across the application
 */
class StripeProviderSingleton {
	private static instance: StripeProvider | null = null;
	private static isInitializing = false;

	private constructor() {}

	public static getInstance(): StripeProvider {
		if (!StripeProviderSingleton.instance && !StripeProviderSingleton.isInitializing) {
			StripeProviderSingleton.isInitializing = true;

			const stripeConfig = ConfigManager.getStripeConfig();

			const configs = createProviderConfigs({
				apiKey: stripeConfig.apiKey,
				webhookSecret: stripeConfig.webhookSecret,
				options: {
					publishableKey: stripeConfig.publishableKey,
					apiVersion: stripeConfig.apiVersion
				}
			});

			StripeProviderSingleton.instance = new StripeProvider(configs.stripe);
			StripeProviderSingleton.isInitializing = false;
		}

		if (!StripeProviderSingleton.instance) {
			throw new Error('Failed to initialize Stripe provider');
		}

		return StripeProviderSingleton.instance;
	}




	/**
	 * Reset singleton instance (useful for testing)
	 */
	public static reset(): void {
		StripeProviderSingleton.instance = null;
		StripeProviderSingleton.isInitializing = false;
	}

	/**
	 * Check if singleton is initialized
	 */
	public static isInitialized(): boolean {
		return StripeProviderSingleton.instance !== null;
	}
}

/**
 * Initialize Stripe provider (singleton pattern)
 * @returns StripeProvider instance
 */
export function initializeStripeProvider(): StripeProvider {
	return StripeProviderSingleton.getInstance();
}

export function initializeLemonsqueezyProvider() {
	try {
		const lemonsqueezyConfig = ConfigManager.getLemonsqueezyConfig();
		lemonSqueezySetup({ apiKey: lemonsqueezyConfig.apiKey });
		console.log('✅ Lemonsqueezy provider initialized successfully');
	} catch (error) {
		console.error('❌ Failed to initialize Lemonsqueezy provider:', error);
		throw new Error(`Failed to initialize Lemonsqueezy provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Get Stripe provider instance without initialization
 * @returns StripeProvider instance or null if not initialized
 */
export function getStripeProvider(): StripeProvider | null {
	return StripeProviderSingleton.isInitialized() ? StripeProviderSingleton.getInstance() : null;
}

/**
 * Reset Stripe provider singleton (useful for testing)
 */
export function resetStripeProvider(): void {
	StripeProviderSingleton.reset();
}

/**
 * Get or create Stripe provider instance (most efficient)
 * @returns StripeProvider instance
 */
export function getOrCreateStripeProvider(): StripeProvider {
	// Try to get existing instance first
	const existingProvider = getStripeProvider();
	if (existingProvider) {
		return existingProvider;
	}

	// Create new instance if none exists
	return initializeStripeProvider();
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: drizzle,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized: ({ auth }) => auth?.user != null,
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith('/')) {
        url = `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
    signIn: async ({ user, account }) => {
      const isCredentials = account?.provider === 'credentials';
      try {
        if (!user?.email) {
          console.warn('Sign-in attempt without email', { provider: account?.provider });
          return !isCredentials;
        }

        // If DATABASE_URL is not set, we can't validate against the database
        if (!isDatabaseAvailable) {
          console.warn('DATABASE_URL is not set, skipping database validation');
          return !isCredentials;
        }

        return true;
      } catch (error) {
        console.error(
          'Error during sign-in validation',
          error instanceof Error
            ? { name: error.name, message: error.message }
            : { message: 'Unknown error' }
        );
        // Fail closed on validation errors
        return false;
      }
    },
    jwt: async ({ token, user, account }) => {

      const extendedUser = user as ExtendedUser;
      
      if (extendedUser?.id && typeof extendedUser.id === "string") {
        token.userId = extendedUser.id;
      }
      if (!token.userId && typeof token.sub === "string") {
        token.userId = token.sub;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }

      if (user) {
        if (typeof extendedUser?.isClient === "boolean") {
          token.isAdmin = !extendedUser.isClient;
        } else if (typeof extendedUser?.isAdmin === "boolean") {
          token.isAdmin = extendedUser.isAdmin;
        } else if (typeof token.isAdmin !== "boolean") {
          // First time without explicit flags: default to non-admin
          token.isAdmin = false;
        }
      }

      // Debug (dev only): trace non-PII auth token composition
      if (process.env.NODE_ENV === 'development') {
        try {
          console.debug('[auth][jwt] token composed', {
            provider: token.provider,
            isAdmin: token.isAdmin,
            hasUser: !!user,
            accountProvider: account?.provider,
          });
        } catch {}
      }
      
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        if (typeof token.userId === "string") {
          session.user.id = token.userId;
        }
        session.user.provider = typeof token.provider === "string" ? token.provider : "credentials";
        if (typeof token.isAdmin === "boolean") {
          session.user.isAdmin = token.isAdmin;
        }
      }
      // Debug (dev only): trace session payload without PII
      if (process.env.NODE_ENV === 'development') {
        try {
          console.debug('[auth][session] session built', {
            isAdmin: (session.user as any)?.isAdmin,
            provider: (session.user as any)?.provider,
          });
        } catch {}
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/register",
  },
  ...authConfig,
});
