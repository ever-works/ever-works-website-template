import { env } from './env.config';

/**
 * Check if required environment variables are set in production
 */
export function checkEnvironmentVariables(): void {
  if (env.isProd) {
    const requiredVars = [
      ['COOKIE_SECRET', env.COOKIE_CONFIG.SECRET],
      ['DATABASE_URL', env.DATABASE_URL],
      ['AUTH_SECRET', env.AUTH_SECRET],
      ['CORS_ORIGIN', env.CORS_CONFIG.ORIGIN],
    ];

    const missingVars = requiredVars
      .filter(([_, value]) => !value)
      .map(([name]) => name);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables in production:\n${missingVars.join('\n')}`
      );
    }

    // Additional production checks
    if (!env.COOKIE_CONFIG.SECURE) {
      throw new Error('COOKIE_SECURE must be true in production');
    }

    if (env.COOKIE_CONFIG.SAME_SITE !== 'strict') {
      throw new Error('COOKIE_SAME_SITE must be "strict" in production');
    }

    // Validate CORS origin in production
    if (!env.CORS_CONFIG.ORIGIN?.startsWith('https://')) {
      throw new Error('CORS_ORIGIN must use HTTPS in production');
    }
  }

  // Log environment configuration in development
  if (env.isDev) {
    console.log('Environment Configuration:', {
      NODE_ENV: env.NODE_ENV,
      API_BASE_URL: env.API_CONFIG.BASE_URL,
      COOKIE_DOMAIN: env.COOKIE_CONFIG.DOMAIN,
      AUTH_ENDPOINTS: env.AUTH_ENDPOINTS,
      CORS: {
        ORIGIN: env.CORS_CONFIG.ORIGIN || '*',
        CREDENTIALS: env.CORS_CONFIG.CREDENTIALS,
      },
    });
  }
} 