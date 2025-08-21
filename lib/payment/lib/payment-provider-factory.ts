import { PaymentProviderInterface, PaymentProviderConfig } from '../types/payment-types';
import { StripeProvider } from './providers/stripe-provider';
import { LemonSqueezyProvider, LemonSqueezyConfig } from './providers/lemonsqueezy-provider';
// import { SolidgateProvider } from './providers/solidgate-provider';

// Type des providers supportés
export type SupportedProvider = 'stripe' | 'solidgate' | 'lemonsqueezy';

/**
 * Factory to create instances of payment providers
 */
export class PaymentProviderFactory {
  /**
   * Create an instance of a payment provider based on the type
   * @param providerType - Type of provider ('stripe', 'solidgate', or 'lemonsqueezy')
   * @param config - Configuration of the provider
   * @returns Instance of the payment provider
   */
  static createProvider(
    providerType: SupportedProvider,
    config: PaymentProviderConfig
  ): PaymentProviderInterface {
    switch (providerType) {
      case 'stripe':
        return new StripeProvider(config);
      case 'solidgate':
        // To activate Solidgate, uncomment the lines below and the import at the top of the file
        // return new SolidgateProvider(config);
        throw new Error('Solidgate provider not implemented yet');
      case 'lemonsqueezy':
        return new LemonSqueezyProvider(config as unknown as LemonSqueezyConfig);
      default:
        throw new Error(`Unsupported payment provider: ${providerType}`);
    }
  }
} 