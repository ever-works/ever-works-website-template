import type { ApiClientConfig } from './types';
import { ApiClient } from './api-client-class';

/**
 * Gestionnaire de singleton pour les instances ApiClient
 */
class ApiClientSingleton {
  private static instance: ApiClient | null = null;

  private constructor() {
    // Prevents direct instantiation
  }

  /**
   * Obtient l'instance unique du client API
   * @param config - Configuration optionnelle pour le client API
   * @returns Instance unique du client API
   */
  public static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClientSingleton.instance) {
      ApiClientSingleton.instance = new ApiClient(config);
    }
    return ApiClientSingleton.instance;
  }

  /**
   * Réinitialise l'instance du singleton (utile pour les tests)
   */
  public static resetInstance(): void {
    ApiClientSingleton.instance = null;
  }
}

export const getApiClient = ApiClientSingleton.getInstance; 