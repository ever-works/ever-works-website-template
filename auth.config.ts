import { NextAuthConfig } from "next-auth";
import { createNextAuthProviders } from "./lib/auth/providers";
import { configureOAuthProviders, logError } from "./lib/auth/error-handler";
import { ErrorType, createAppError } from "./lib/utils/error-handler";

// Configure providers safely with error handling
const configureProviders = () => {
  try {
    // Get safely configured OAuth providers based on available env vars
    const oauthProviders = configureOAuthProviders();
    
    // Always enable credentials provider as it doesn't require external config
    return createNextAuthProviders({
      google: oauthProviders.find(p => p.id === 'google') ? {
        enabled: true,
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      } : { enabled: false },
      github: oauthProviders.find(p => p.id === 'github') ? {
        enabled: true,
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      } : { enabled: false },
      facebook: oauthProviders.find(p => p.id === 'facebook') ? {
        enabled: true,
        clientId: process.env.FACEBOOK_CLIENT_ID || '',
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      } : { enabled: false },
      twitter: oauthProviders.find(p => p.id === 'twitter') ? {
        enabled: true,
        clientId: process.env.TWITTER_CLIENT_ID || '',
        clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      } : { enabled: false },
      credentials: {
        enabled: true,
      },
    });
  } catch (error) {
    // Log the error but continue with only credentials provider
    const appError = createAppError(
      'Failed to configure OAuth providers. Falling back to credentials only.',
      ErrorType.CONFIG,
      'OAUTH_CONFIG_FAILED',
      error
    );
    logError(appError, 'Auth Config');
    
    // Fallback to credentials only
    return createNextAuthProviders({
      credentials: { enabled: true },
      google: { enabled: false },
      github: { enabled: false },
      facebook: { enabled: false },
      twitter: { enabled: false },
    });
  }
};

// Notice this is only an object, not a full Auth.js instance
export default {
  trustHost: true,
  providers: configureProviders(),
} satisfies NextAuthConfig;
