import { createAppError, ErrorType, validateEnvVariables, logError } from '../utils/error-handler';
export { logError } from '../utils/error-handler';

/**
 * Validates required environment variables for authentication providers
 */
export function validateAuthConfig() {
  // Base NextAuth environment variables
  const baseNextAuthVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  // Provider-specific environment variables
  const providerEnvVars = {
    google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    github: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
    facebook: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
    microsoft: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
    supabase: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
  };

  // Check base NextAuth variables
  const baseError = validateEnvVariables(baseNextAuthVars);
  if (baseError) {
    logError(baseError, 'Auth Config');
    throw baseError;
  }

  // Check which providers are enabled based on environment variables
  const enabledProviders: Record<string, boolean> = {};
  
  Object.entries(providerEnvVars).forEach(([provider, vars]) => {
    const hasAllVars = vars.every(varName => !!process.env[varName]);
    enabledProviders[provider] = hasAllVars;
    
    // Log warning for partially configured providers
    if (!hasAllVars && vars.some(varName => !!process.env[varName])) {
      const missingVars = vars.filter(varName => !process.env[varName]);
      const warning = createAppError(
        `Partial configuration for ${provider} provider. Missing: ${missingVars.join(', ')}`,
        ErrorType.CONFIG,
        'ENV_PARTIAL'
      );
      logError(warning, 'Auth Config');
    }
  });

  return enabledProviders;
}

/**
 * Safely configures OAuth providers based on available environment variables
 */
export function configureOAuthProviders() {
  const enabledProviders = validateAuthConfig();
  
  const providers: any[] = [];
  
  // Only add providers that have all required environment variables
  if (enabledProviders.google) {
    providers.push({
      id: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    });
  }
  
  if (enabledProviders.github) {
    providers.push({
      id: 'github',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    });
  }
  
  if (enabledProviders.facebook) {
    providers.push({
      id: 'facebook',
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    });
  }
  
  if (enabledProviders.microsoft) {
    providers.push({
      id: 'microsoft',
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET
    });
  }
  
  return providers;
}

/**
 * Handles authentication errors with appropriate messages
 */
export function handleAuthError(error: any): { error: string } {
  let errorMessage = "An unknown authentication error occurred";
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('GOOGLE_CLIENT_ID')) {
      errorMessage = "Google authentication is not properly configured";
    } else if (error.message.includes('GITHUB_CLIENT_ID')) {
      errorMessage = "GitHub authentication is not properly configured";
    } else if (error.message.includes('FACEBOOK_CLIENT_ID')) {
      errorMessage = "Facebook authentication is not properly configured";
    } else if (error.message.includes('MICROSOFT_CLIENT_ID')) {
      errorMessage = "Microsoft authentication is not properly configured";
    } else if (error.message.includes('SUPABASE')) {
      errorMessage = "Supabase authentication is not properly configured";
    } else if (error.message.includes('NEXTAUTH')) {
      errorMessage = "NextAuth is not properly configured";
    } else {
      // Use the original error message if it's not related to configuration
      errorMessage = error.message;
    }
    
    // Log the error with context
    logError(error, 'Authentication');
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  return { error: errorMessage };
}
