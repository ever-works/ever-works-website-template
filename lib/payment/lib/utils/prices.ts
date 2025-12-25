import { CountryPricing } from "../../types/payment-types";

// Helper to parse price with proper NaN fallback
const parsePrice = (envVar: string | undefined, defaultValue: number): number => {
	const parsed = parseFloat(envVar ?? '');
	return Number.isNaN(parsed) ? defaultValue : parsed;
};

// Get prices from environment variables (client-safe NEXT_PUBLIC_* vars)
const standardPrice = parsePrice(process.env.NEXT_PUBLIC_PRODUCT_PRICE_STANDARD, 10);
const premiumPrice = parsePrice(process.env.NEXT_PUBLIC_PRODUCT_PRICE_PREMIUM, 20);
const freePrice = parsePrice(process.env.NEXT_PUBLIC_PRODUCT_PRICE_FREE, 0);

export const PRICES: Record<string, CountryPricing> = {
    us: {
      country: 'us',
      currency: 'usd',
      symbol: '$',
      subscription: {
        amount: standardPrice,
        formatted: `$${standardPrice}`,
        collect_tax: false
      },
      oneTime: {
        amount: premiumPrice,
        formatted: `$${premiumPrice}`,
        collect_tax: false
      },
      free: {
        amount: freePrice,
        formatted: `$${freePrice}`,
        collect_tax: false
      }
    }
  }
  
/**
 * Get the number of decimal places for a currency
 * @param currency - The currency code
 * @returns The number of decimal places
 */
  export function getCurrencyDecimalPlaces(currency: string): number {
    const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'IDR'];
    return zeroDecimalCurrencies.includes(currency) ? 0 : 2;
  }


  /**
   * Format an amount for a currency
   * @param amount - The amount to format
   * @param currency - The currency code
   * @returns The formatted amount
   */
  export function formatAmountForCurrency(amount: number, currency: string): number {
    const decimalPlaces = getCurrencyDecimalPlaces(currency);
    if (decimalPlaces === 0) {
      return Math.round(amount);
    }
    return Math.round(amount * 100);
  }