import { PaymentService } from './payment-service';
import { SupportedProvider, PaymentProviderConfig } from '../types/payment-types';

/**
 * Manager class for handling payment service instances and provider switching
 */
export class PaymentServiceManager {
  private static instance: PaymentServiceManager;
  private currentService: PaymentService | null = null;
  private readonly STORAGE_KEY = 'selected_payment_provider';
  private providerConfigs: Record<SupportedProvider, PaymentProviderConfig>;

  private constructor(providerConfigs: Record<SupportedProvider, PaymentProviderConfig>) {
    this.providerConfigs = providerConfigs;
  }

  /**
   * Get the singleton instance of PaymentServiceManager
   */
  static getInstance(providerConfigs: Record<SupportedProvider, PaymentProviderConfig>): PaymentServiceManager {
    if (!PaymentServiceManager.instance) {
      PaymentServiceManager.instance = new PaymentServiceManager(providerConfigs);
    }
    return PaymentServiceManager.instance;
  }

  /**
   * Get the stored provider from localStorage
   */
  private getStoredProvider(): SupportedProvider {
    if (typeof window === 'undefined') return 'stripe'; // Default for SSR
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return (stored as SupportedProvider) || 'stripe';
  }

  /**
   * Store the provider in localStorage
   */
  private setStoredProvider(provider: SupportedProvider): void {
    if (typeof window === 'undefined') return; // Skip for SSR
    localStorage.setItem(this.STORAGE_KEY, provider);
  }

  /**
   * Get the current payment service instance
   */
  getPaymentService(): PaymentService {
    if (!this.currentService) {
      const provider = this.getStoredProvider();
      this.currentService = new PaymentService({
        provider,
        config: this.providerConfigs[provider]
      });
    }
    return this.currentService;
  }

  /**
   * Switch to a different payment provider
   */
  async switchProvider(newProvider: SupportedProvider): Promise<void> {
    if (this.getStoredProvider() !== newProvider) {
      this.setStoredProvider(newProvider);
      this.currentService = new PaymentService({
        provider: newProvider,
        config: this.providerConfigs[newProvider]
      });
    }
  }

  /**
   * Get the current provider
   */
  getCurrentProvider(): SupportedProvider {
    return this.getStoredProvider();
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): SupportedProvider[] {
    return Object.keys(this.providerConfigs) as SupportedProvider[];
  }
} 