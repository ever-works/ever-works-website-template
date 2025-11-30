/**
 * Server-side configuration utilities
 * For use in API routes and server components
 */

import { getCachedConfig, type Config } from '@/lib/content';


interface ServerConfig {
  supportEmail: string;
  companyName: string;
  appUrl: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  databaseUrl: string;
}

/**
 * Get server configuration from environment variables
 * Validates required variables and provides defaults where appropriate
 */
export function getServerConfig(): ServerConfig {
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@ever.works';
  const companyName = process.env.COMPANY_NAME || "Ever Works";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.ever.works';
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  // Validate required environment variables
  const requiredVars = {
    SUPPORT_EMAIL: supportEmail,
    NEXT_PUBLIC_APP_URL: appUrl,
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
    DATABASE_URL: databaseUrl,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    supportEmail: supportEmail!,
    companyName,
    appUrl: appUrl!,
    stripeSecretKey: stripeSecretKey!,
    stripeWebhookSecret: stripeWebhookSecret!,
    databaseUrl: databaseUrl!,
  };
}

/**
 * Get configuration from config.yml file (same as useConfig hook)
 * This is the server-side equivalent of useConfig()
 */
export async function getConfigFromFile(): Promise<Config> {
  try {
    // Import dynamically to avoid issues
    return await getCachedConfig();
  } catch (error) {
    console.error('Failed to load config from file:', error);
    return {};
  }
}

/**
 * Get email configuration from config file + environment variables
 * Used by email services and webhook handlers
 */
export async function getEmailConfig() {
  const config = await getConfigFromFile();

  // Get values from config file first, then fallback to environment variables
  const supportEmail = (typeof config.mail === 'object' && 'from' in config.mail)
    ? config.mail.from
    : process.env.SUPPORT_EMAIL;

  const companyName = config.company_name || process.env.COMPANY_NAME || "Ever Works";
  const appUrl = config.app_url || process.env.NEXT_PUBLIC_APP_URL || 'https://app.ever.works';

  // Validate required values
  if (!supportEmail) {
    console.error('SUPPORT_EMAIL not found in config file or environment variables');
    throw new Error('Email configuration is incomplete');
  }

  if (!appUrl) {
    console.error('app_url not found in config file or environment variables');
    throw new Error('App URL configuration is required');
  }

  return {
    supportEmail,
    companyName,
    companyUrl: appUrl,
  };
}

/**
 * Get Stripe configuration
 * Used by payment services
 */
export function getStripeConfig() {
  const config = getServerConfig();
  
  return {
    secretKey: config.stripeSecretKey,
    webhookSecret: config.stripeWebhookSecret,
  };
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get the current environment
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}
