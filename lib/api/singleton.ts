import { ApiClient, ApiClientConfig } from './api-client';

/**
 * Singleton manager for ApiClient instances
 * Provides better control over instance lifecycle and configuration
 */
export class ApiClientManager {
  private static instance: ApiClientManager | null = null;
  private clients: Map<string, ApiClient> = new Map();
  private defaultClientKey = 'default';

  private constructor() {}

  /**
   * Get the singleton instance of ApiClientManager
   */
  public static getInstance(): ApiClientManager {
    if (!ApiClientManager.instance) {
      ApiClientManager.instance = new ApiClientManager();
    }
    return ApiClientManager.instance;
  }

  /**
   * Get or create an API client instance
   * @param config - Optional configuration for the client
   * @param key - Optional key to identify the client instance
   */
  public getClient(config?: ApiClientConfig, key: string = this.defaultClientKey): ApiClient {
    if (!this.clients.has(key)) {
      this.clients.set(key, ApiClient.getInstance(config));
    }
    return this.clients.get(key)!;
  }

  /**
   * Create a new client instance with custom configuration
   * @param config - Configuration for the new client
   * @param key - Optional key to identify the client instance
   */
  public createClient(config: ApiClientConfig, key: string = this.defaultClientKey): ApiClient {
    ApiClient.resetInstance();
    const client = ApiClient.getInstance(config);
    this.clients.set(key, client);
    return client;
  }

  /**
   * Reset a specific client instance
   * @param key - Key of the client to reset
   */
  public resetClient(key: string = this.defaultClientKey): void {
    if (this.clients.has(key)) {
      ApiClient.resetInstance();
      this.clients.delete(key);
    }
  }

  /**
   * Reset all client instances
   */
  public resetAllClients(): void {
    ApiClient.resetInstance();
    this.clients.clear();
  }

  /**
   * Check if a client instance exists
   * @param key - Key of the client to check
   */
  public hasClient(key: string): boolean {
    return this.clients.has(key);
  }

  /**
   * Get all client instance keys
   */
  public getClientKeys(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Get the number of active client instances
   */
  public getClientCount(): number {
    return this.clients.size;
  }
}

// Export a default instance
export const apiManager = ApiClientManager.getInstance();

// Export helper functions for common use cases
export const getDefaultClient = (config?: ApiClientConfig): ApiClient => {
  return apiManager.getClient(config);
};

export const createCustomClient = (config: ApiClientConfig, key?: string): ApiClient => {
  return apiManager.createClient(config, key);
}; 