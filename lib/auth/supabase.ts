import { getAuthConfig } from './config';

// Define types for Supabase client and auth methods
interface SupabaseAuthResponse<T> {
  data: T;
  error: Error | null;
}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number; // Make expires_at optional to match Supabase's type
  user: SupabaseUser;
}

/**
 * Create a Supabase client with the configured URL and anonymous key
 * This function dynamically imports Supabase only when needed
 */
export async function createSupabaseClient() {
  const config = getAuthConfig();
  
  if (!config.supabase?.url || !config.supabase?.anonKey) {
    throw new Error('Supabase configuration is missing. Please provide URL and anonymous key.');
  }
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    return createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
  } catch (error) {
    console.error('Failed to load Supabase client:', error);
    throw new Error('Supabase client could not be loaded. Please install @supabase/supabase-js package.');
  }
}

/**
 * Supabase authentication provider
 * This implementation uses dynamic imports to load Supabase only when needed
 */
export const supabaseAuth = {
  /**
   * Sign in with email and password
   */
  signInWithPassword: async (email: string, password: string): Promise<SupabaseAuthResponse<{ session: SupabaseSession | null; user: SupabaseUser | null }>> => {
    try {
      const supabase = await createSupabaseClient();
      return supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      console.error('Supabase auth error:', error);
      return { data: { session: null, user: null }, error: error as Error };
    }
  },
  
  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth: async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
    try {
      const supabase = await createSupabaseClient();
      const config = getAuthConfig();
      return supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: config.supabase?.redirectUrl
        }
      });
    } catch (error) {
      console.error('Supabase OAuth error:', error);
      return { data: { provider, url: null }, error: error as Error };
    }
  },
  
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string) => {
    try {
      const supabase = await createSupabaseClient();
      return supabase.auth.signUp({ email, password });
    } catch (error) {
      console.error('Supabase signup error:', error);
      return { data: { session: null, user: null }, error: error as Error };
    }
  },
  
  /**
   * Sign out
   */
  signOut: async () => {
    try {
      const supabase = await createSupabaseClient();
      return supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase signout error:', error);
      return { error: error as Error };
    }
  },
  
  /**
   * Get the current user
   */
  getUser: async () => {
    try {
      const supabase = await createSupabaseClient();
      return supabase.auth.getUser();
    } catch (error) {
      console.error('Supabase get user error:', error);
      return { data: { user: null }, error: error as Error };
    }
  },
  
  /**
   * Get the current session
   */
  getSession: async () => {
    try {
      const supabase = await createSupabaseClient();
      return supabase.auth.getSession();
    } catch (error) {
      console.error('Supabase get session error:', error);
      return { data: { session: null }, error: error as Error };
    }
  },
  
  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    try {
      const supabase = await createSupabaseClient();
      const config = getAuthConfig();
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: config.supabase?.redirectUrl
      });
    } catch (error) {
      console.error('Supabase reset password error:', error);
      return { error: error as Error };
    }
  },
  
  /**
   * Update password
   */
  updatePassword: async (password: string) => {
    try {
      const supabase = await createSupabaseClient();
      return supabase.auth.updateUser({ password });
    } catch (error) {
      console.error('Supabase update password error:', error);
      return { data: { user: null }, error: error as Error };
    }
  },
  
  /**
   * Update user
   */
  updateUser: async (attributes: { email?: string; password?: string; data?: any }) => {
    try {
      const supabase = await createSupabaseClient();
      return supabase.auth.updateUser(attributes);
    } catch (error) {
      console.error('Supabase update user error:', error);
      return { data: { user: null }, error: error as Error };
    }
  }
};
