/**
 * Currency Formatting Utilities
 *
 * Provides consistent currency formatting across the application
 * Uses user's detected currency preference
 */

/**
 * Format amount in cents to currency string
 * Uses user's currency preference if available
 */
export function formatCurrency(amountInCents: number, currency: string = 'USD', locale: string = 'en-US'): string {
	const amount = amountInCents / 100;
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency.toUpperCase(),
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}

/**
 * Format amount (already in major units) to currency string
 */
export function formatCurrencyAmount(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency.toUpperCase(),
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
	const currencySymbols: Record<string, string> = {
		USD: '$',
		EUR: '€',
		GBP: '£',
		JPY: '¥',
		CNY: '¥',
		CAD: 'C$',
		AUD: 'A$',
		CHF: 'CHF',
		INR: '₹',
		BRL: 'R$',
		MXN: '$',
		KRW: '₩',
		RUB: '₽',
		TRY: '₺',
		ZAR: 'R',
		SGD: 'S$',
		HKD: 'HK$',
		NOK: 'kr',
		SEK: 'kr',
		DKK: 'kr',
		PLN: 'zł',
		CZK: 'Kč',
		HUF: 'Ft'
	};

	return currencySymbols[currency.toUpperCase()] || currency.toUpperCase();
}

/**
 * Format amount with currency symbol (simple format)
 */
export function formatAmountWithSymbol(amount: number, currency: string = 'USD'): string {
	const symbol = getCurrencySymbol(currency);
	return `${symbol}${amount.toFixed(2)}`;
}
