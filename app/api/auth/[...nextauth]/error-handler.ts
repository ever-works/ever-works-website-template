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
 * Checks for missing environment variables required by NextAuth
 * @returns Error message if variables are missing, null otherwise
 */
export function checkNextAuthEnvironment(): string | null {
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required NextAuth environment variables: ${missingVars.join(', ')}`;
    const appError = createAppError(
      errorMessage,
      ErrorType.CONFIG,
      'ENV_MISSING'
    );
    logError(appError, 'NextAuth Config');
    return errorMessage;
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
