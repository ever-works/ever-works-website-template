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


export function initializeStripeProvider() {
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

  return new StripeProvider(configs.stripe);
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
