/**
 * Main authentication configuration file
 * Sets up NextAuth.js with Drizzle adapter and custom callbacks
 */

import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { accounts, sessions, users, verificationTokens } from '../db/schema';
import { db } from '../db/drizzle';
import authConfig from '../../auth.config';
import { getUserByEmail, getUserPaymentAccountByProvider } from '../db/queries';
import { createProviderConfigs, StripeProvider } from '../payment';

// Check if DATABASE_URL is set
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Only create the Drizzle adapter if DATABASE_URL is available
const drizzle = isDatabaseAvailable
	? DrizzleAdapter(db, {
			usersTable: users,
			accountsTable: accounts,
			sessionsTable: sessions,
			verificationTokensTable: verificationTokens
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
      
      const requiredEnvVars = {
        apiKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      };

      if (!requiredEnvVars.apiKey || !requiredEnvVars.webhookSecret || !requiredEnvVars.publishableKey) {
        throw new Error('Stripe configuration is incomplete');
      }

      const configs = createProviderConfigs({
        apiKey: requiredEnvVars.apiKey,
        webhookSecret: requiredEnvVars.webhookSecret,
        options: {
          publishableKey: requiredEnvVars.publishableKey,
          apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16'
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
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60 // 24 hours
	},
	jwt: {
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},
	callbacks: {
		authorized: ({ auth }) => auth?.user != null,
		signIn: async ({ user, account }) => {
			try {
				if (!user?.email) {
					console.warn('Sign-in attempt without email', { provider: account?.provider });
					return account?.provider !== 'credentials';
				}

				// If DATABASE_URL is not set, we can't validate against the database
				if (!process.env.DATABASE_URL) {
					console.warn('DATABASE_URL is not set, skipping database validation');
					// Allow OAuth sign-ins but not credentials without a database
					return account?.provider !== 'credentials';
				}

				const foundUser = await getUserByEmail(user.email);

				// If getUserByEmail returns null, it means the database is not available
				if (foundUser === null) {
					console.warn('Database validation failed, user might not exist');
					// Allow OAuth sign-ins but not credentials when validation fails
					return account?.provider !== 'credentials';
				}

				if (foundUser) {
					return true;
				}

				if (account?.provider !== 'credentials') {
					return true;
				}

				return false;
			} catch (error) {
				console.error('Error during sign-in validation:', error);
				if (error instanceof Error && error.message === 'User not found') {
					return account?.provider !== 'credentials';
				}
				return false;
			}
		},
		jwt: async ({ token, user, account }) => {
			// Always fetch the user from the database to get isAdmin
			let paymentAccount = null;
			let dbUser = null;
			if (user?.email) {
				dbUser = await getUserByEmail(user.email);
			} else if (token?.email) {
				dbUser = await getUserByEmail(token.email);
			}

			if (user?.id && typeof user.id === 'string') {
				token.userId = user.id;
			}
			if (!token.userId && typeof token.sub === 'string') {
				token.userId = token.sub;
			}
			token.provider = account?.provider || 'credentials';
			if (token.userId) {
				paymentAccount = await getUserPaymentAccountByProvider(token.userId as string, 'stripe');
				token.customerId = paymentAccount?.customerId;
			}

			// Add isAdmin to token if available from dbUser
			if (dbUser) {
				const isAdmin = dbUser.isAdmin ?? dbUser.is_admin;
				if (typeof isAdmin === 'boolean') {
					token.isAdmin = isAdmin;
				}
			}

			return token;
		},
		session: async ({ session, token }) => {
			if (token && session.user) {
				if (typeof token.userId === 'string') {
					session.user.id = token.userId;
				}
				session.user.provider = typeof token.provider === 'string' ? token.provider : 'credentials';
				if (typeof token.isAdmin === 'boolean') {
					session.user.isAdmin = token.isAdmin;
				}
				if (typeof token.customerId === 'string') {
					session.user.customerId = token.customerId;
				}
			}

			return session;
		}
	},
	pages: {
		signIn: '/auth/signin',
		signOut: '/auth/signout',
		error: '/auth/error',
		verifyRequest: '/auth/verify-request',
		newUser: '/auth/register'
	},
	...authConfig
});
