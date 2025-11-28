import { NextApiRequest, NextApiResponse } from 'next';
import { logError, ErrorType, createAppError } from '@/lib/utils/error-handler';

/**
 * Handles NextAuth specific errors and provides appropriate responses
 */
export function handleNextAuthError(
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse
): void {
  // Create a structured error object
  const appError = createAppError(
    error.message,
    ErrorType.AUTH,
    'NEXTAUTH_ERROR',
    error
  );
  
  // Log the error with context
  logError(appError, 'NextAuth');
  
  // Determine the appropriate status code
  let statusCode = 500;
  
  if (error.message.includes('OAuth')) {
    statusCode = 400; // Bad request for OAuth configuration issues
  } else if (error.message.includes('credentials')) {
    statusCode = 401; // Unauthorized for credential issues
  } else if (error.message.includes('CSRF')) {
    statusCode = 403; // Forbidden for CSRF issues
  }
  
  // Send an appropriate response
  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An authentication error occurred' 
        : error.message,
      status: statusCode
    }
  });
}

/**
 * Checks for missing environment variables used by NextAuth
 * @returns Warning message if variables are missing, null otherwise
 */
export function checkNextAuthEnvironment(): string | null {
  const optionalVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const missingVars = optionalVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const warningMessage = `Missing NextAuth environment variables: ${missingVars.join(', ')}`;
    
    // Suppress warnings during CI/linting
    const shouldSuppress = 
      process.env.CI === 'true' ||
      process.env.NODE_ENV === 'test' ||
      process.argv.some(arg => /(?:^|[/\\])(eslint|lint(?:-staged)?)(?:\.[jt]s)?$/.test(arg));
    
    if (!shouldSuppress) {
      console.warn(`[NextAuth Config] ${warningMessage}. Authentication features may be limited.`);
    }
    
    // Generate default values for missing variables
    if (!process.env.NEXTAUTH_SECRET) {
      // Generate a random string for NEXTAUTH_SECRET
      process.env.NEXTAUTH_SECRET = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);
      if (!shouldSuppress) {
        console.warn('[NextAuth Config] Generated temporary NEXTAUTH_SECRET for development');
      }
    }
    
    if (!process.env.NEXTAUTH_URL) {
      // Set a default URL for local development
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      if (!shouldSuppress) {
        console.warn('[NextAuth Config] Using default NEXTAUTH_URL: http://localhost:3000');
      }
    }
    
    return warningMessage;
  }
  
  return null;
}

/**
 * Checks if a specific OAuth provider has all required environment variables
 * @param provider The OAuth provider to check
 * @returns True if the provider is properly configured, false otherwise
 */
export function isOAuthProviderConfigured(provider: string): boolean {
  const providerEnvVars: Record<string, string[]> = {
    google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    github: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
    facebook: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
    twitter: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
    microsoft: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET']
  };
  
  const vars = providerEnvVars[provider.toLowerCase()];
  if (!vars) return false;
  
  return vars.every(varName => !!process.env[varName]);
}
