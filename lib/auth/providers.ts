/**
 * Authentication providers configuration
 * This file configures all supported OAuth providers for the application
 */

import { credentialsProvider } from "./credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import MicrosoftProvider from "next-auth/providers/azure-ad";

/**
 * Supported OAuth provider types
 * These are the OAuth providers that the application supports for authentication
 */
export type OAuthProviderType = 'google' | 'github' | 'facebook' | 'twitter' | 'microsoft';

/**
 * OAuth provider configuration
 * Configuration for each OAuth provider including client credentials and additional options
 * - enabled: Whether this provider is enabled for authentication
 * - clientId: The OAuth client ID from the provider's developer console
 * - clientSecret: The OAuth client secret from the provider's developer console
 * - options: Additional provider-specific options
 */
export interface OAuthProviderConfig {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  options?: Record<string, any>;
}

/**
 * OAuth providers configuration
 * Complete configuration for all supported OAuth providers
 * Each provider can be individually configured or disabled
 */
export interface OAuthProvidersConfig {
  google?: OAuthProviderConfig;
  github?: OAuthProviderConfig;
  facebook?: OAuthProviderConfig;
  twitter?: OAuthProviderConfig;
  microsoft?: OAuthProviderConfig;
}


/**
 * Common OAuth configuration options applied to all providers
 * 
 * - allowDangerousEmailAccountLinking: Allows users to link accounts with the same email address
 *   This is useful for users who sign up with different providers but use the same email
 * 
 * - authorization: Configuration for the OAuth authorization flow
 *   - access_type: "offline" allows the application to refresh tokens when the user is not present
 *   - prompt: "consent" ensures the user is always prompted for consent, even if they've authorized before
 */
const commonOAuthOptions = {
  allowDangerousEmailAccountLinking: true,
  authorization: {
    params: {
      access_type: "offline",
      prompt: "consent",
    },
  },
};

/**
 * Factory function to create OAuth provider instances with consistent configuration
 * 
 * @param Provider - The NextAuth provider class (GoogleProvider, GitHubProvider, etc.)
 * @param clientId - The OAuth client ID from environment variables
 * @param clientSecret - The OAuth client secret from environment variables
 * @returns Configured provider instance with common options applied
 */
const createProvider = (
  Provider: any,
  clientId: string | undefined,
  clientSecret: string | undefined
) =>
  Provider({
    clientId: clientId!,
    clientSecret: clientSecret!,
    ...commonOAuthOptions,
  });

/**
 * Array of configured authentication providers for NextAuth
 * These providers will be available for user authentication
 * 
 * Includes:
 * - Credentials provider (email/password)
 * - Google OAuth
 * - GitHub OAuth
 * - Facebook OAuth
 * - Twitter OAuth
 * - Microsoft OAuth
 * 
 * Environment variables for each provider must be set in .env.local
 */
export const providers = [
  credentialsProvider,
  createProvider(
    GoogleProvider, 
    process.env.GOOGLE_CLIENT_ID, 
    process.env.GOOGLE_CLIENT_SECRET
  ),
  createProvider(
    GitHubProvider, 
    process.env.GITHUB_CLIENT_ID, 
    process.env.GITHUB_CLIENT_SECRET
  ),
  createProvider(
    FacebookProvider, 
    process.env.FB_CLIENT_ID, 
    process.env.FB_CLIENT_SECRET
  ),
  createProvider(
    TwitterProvider, 
    process.env.X_CLIENT_ID, 
    process.env.X_CLIENT_SECRET
  ),
  createProvider(
    MicrosoftProvider, 
    process.env.MICROSOFT_CLIENT_ID, 
    process.env.MICROSOFT_CLIENT_SECRET
  ),
];
