export interface AuthService {
    signIn(email: string, password: string): Promise<any>;
    signOut(): Promise<void>;
    signUp(email: string, password: string): Promise<any>;
    getCurrentUser(): Promise<any | null>;
    signInWithCredentials(credentials: any): Promise<any>;
    signInWithOAuth(provider: any, options?: any): Promise<any>;
}
