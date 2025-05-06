/**
 * Authentication configuration for the application
 * Allows choosing between Supabase Auth, Next-Auth, or both
 */

export type AuthProviderType = 'supabase' | 'next-auth' | 'both';

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
  provider: 'next-auth',
  nextAuth: {
    enableCredentials: true,
    enableOAuth: true,
  }
};

/**
 * Get the current authentication configuration
 * This can be overridden by the application
 */
export function getAuthConfig(): AuthConfig {
  // Check if there's a global configuration set by configureAuth()
  if (typeof global !== 'undefined' && (global as any).__authConfig) {
    return (global as any).__authConfig;
  }
  
  // Check for environment variables
  if (typeof process !== 'undefined' && process.env) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // If Supabase environment variables are set, enable Supabase auth
    if (supabaseUrl && supabaseAnonKey) {
      return {
        ...defaultAuthConfig,
        provider: defaultAuthConfig.provider === 'next-auth' ? 'both' : defaultAuthConfig.provider,
        supabase: {
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        }
      };
    }
  }
  
  // Fall back to default configuration
  return defaultAuthConfig;
}
