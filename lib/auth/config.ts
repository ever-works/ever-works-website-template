/**
 * Authentication configuration for the application
 * Allows choosing between Supabase Auth, Next-Auth, or both
 */

export type AuthProviderType = "supabase" | "next-auth" | "both";

export interface AuthConfig {
  /**
   * The authentication provider to use
   * @default 'next-auth'
   */
  provider: AuthProviderType;

  /**
   * Supabase configuration
   */
  supabase?: {
    /**
     * Supabase URL
     */
    url: string;

    /**
     * Supabase anonymous key
     */
    anonKey: string;

    /**
     * Redirect URL after authentication
     */
    redirectUrl?: string;
  };

  /**
   * Next-Auth configuration
   */
  nextAuth?: {
    /**
     * Enable credentials provider
     * @default true
     */
    enableCredentials?: boolean;

    /**
     * Enable OAuth providers
     * @default true
     */
    enableOAuth?: boolean;

    /**
     * Custom providers configuration
     */
    providers?: any[];
  };
}

/**
 * Default authentication configuration
 */
export const defaultAuthConfig: AuthConfig = {
  provider: "next-auth",
  supabase: process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    : undefined,
  nextAuth: {
    enableCredentials: true,
    enableOAuth: true,
  },
};

/**
 * Retrieves the current authentication configuration.
 * 
 * This function follows a hierarchical approach to determine the auth configuration:
 * 1. First checks for a global override set by configureAuth()
 * 2. Then checks for environment variables to detect Supabase configuration
 * 3. Falls back to the default configuration if neither is available
 * 
 * @returns {AuthConfig} The resolved authentication configuration
 */
export function getAuthConfig(): AuthConfig {
  // Priority 1: Check for global configuration override
  if (typeof global !== "undefined" && (global as any).__authConfig) {
    return (global as any).__authConfig;
  }

  // Priority 2: Check for environment-based configuration
  const envConfig = getEnvironmentBasedConfig();
  if (envConfig) {
    return envConfig;
  }

  // Priority 3: Fall back to default configuration
  return defaultAuthConfig;
}

/**
 * Determines authentication configuration based on environment variables.
 * 
 * @returns {AuthConfig | null} Environment-based auth config or null if not available
 */
function getEnvironmentBasedConfig(): AuthConfig | null {
  if (typeof process === "undefined" || !process.env) {
    return null;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If Supabase environment variables are present, create a Supabase-enabled config
  if (supabaseUrl && supabaseAnonKey) {
    return {
      ...defaultAuthConfig,
      // Determine the appropriate provider based on default config
      provider: determineProviderType(defaultAuthConfig.provider),
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      },
    };
  }
  
  return null;
}

/**
 * Determines the appropriate provider type based on the default provider
 * and the fact that Supabase is available.
 * 
 * @param {AuthProviderType} defaultProvider - The default provider type
 * @returns {AuthProviderType} The determined provider type
 */
function determineProviderType(defaultProvider: AuthProviderType): AuthProviderType {
  // When Supabase is available:
  // - If default is 'supabase', keep it as 'supabase'
  // - If default is 'next-auth', keep it as 'next-auth'
  // - Otherwise, use 'both'
  return defaultProvider === "supabase" || defaultProvider === "next-auth"
    ? defaultProvider
    : "both";
}
