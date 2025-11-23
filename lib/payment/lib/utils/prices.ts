import { CountryPricing } from "../../types/payment-types";

export const PRICES: Record<string, CountryPricing> = {
    us: {
      country: 'us',
      currency: 'usd',
      symbol: '$',
      subscription: {
        amount: Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE_PRO) || 10.00,
        formatted: `$${Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE_PRO) || 10.00}`,
        collect_tax: false
      },
      oneTime: {
        amount: Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE_SPONSOR) || 20.00,
        formatted: `$${Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE_SPONSOR) || 20.00}`,
        collect_tax: false
      },
      free: {
        amount: Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE_FREE) || 0.00,
        formatted: `$${Number(process.env.NEXT_PUBLIC_PRODUCT_PRICE_FREE) || 0.00}`,
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