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
  