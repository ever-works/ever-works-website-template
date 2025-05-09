import { AuthService } from "./auth.service";
import { signIn, signOut } from "@/lib/auth";
import { AuthProviders } from "@/lib/auth/credentials";
import { getSession } from "next-auth/react";


export class NextAuthService implements AuthService {
  private static instance: NextAuthService;

  static getInstance(): NextAuthService {
    if (!NextAuthService.instance) {
      NextAuthService.instance = new NextAuthService();
    }
    return NextAuthService.instance;
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const result = await signIn(AuthProviders.CREDENTIALS, {
        email,
        password,
        redirect: false,
      });
      return { error: result?.error || null };
    } catch (error) {
      console.error("Error in NextAuth signIn:", error);
      return { error };
    }
  }

  async signOut(): Promise<any> {
    await signOut({ redirectTo: "/auth/signin" });
  }

  async signUp(email: string, password: string): Promise<any> {
    const { error } = await signIn(AuthProviders.CREDENTIALS, {
      email,
      password,
      redirect: false,
    });
    if (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<any | null> {
    const session = await getSession();
    if (!session) {
      return null;
    }
    return session.user;
  }

  async signInWithCredentials(credentials: any): Promise<any> {
    const { error } = await signIn(AuthProviders.CREDENTIALS, {
      ...credentials,
      redirect: false,
    });
    if (error) {
      throw error;
    }
  }

  async signInWithOAuth(provider: any, options?: any): Promise<any> {
    try {
      return await signIn(provider, {
        redirect: false,
        ...options,
      });
    } catch (error) {
      console.error("Error in signInWithOAuth:", error);
      throw error;
    }
  }
}
