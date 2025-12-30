import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getUserCurrency, updateUserCurrency } from '@/lib/services/currency.service';

// Whitelist of supported ISO 4217 currency codes
const SUPPORTED_CURRENCIES = [
	'USD',
	'EUR',
	'GBP',
	'JPY',
	'CNY',
	'CAD',
	'AUD',
	'CHF',
	'INR',
	'BRL',
	'MXN',
	'KRW',
	'RUB',
	'TRY',
	'ZAR',
	'SGD',
	'HKD',
	'NOK',
	'SEK',
	'DKK',
	'PLN',
	'CZK',
	'HUF',
	'NZD',
	'THB',
	'ILS',
	'CLP',
	'PHP',
	'AED',
	'SAR',
	'MYR',
	'IDR',
	'VND',
	'BGN',
	'RON',
	// HRK removed - Croatia adopted EUR on January 1, 2023
	'ISK',
	'BWP',
	'COP',
	'PEN'
] as const;

const currencyUpdateSchema = z.object({
	currency: z
		.string()
		.trim()
		.min(1, 'Currency code is required')
		.max(3, 'Currency code must be 3 characters')
		.toUpperCase()
		.refine((val) => SUPPORTED_CURRENCIES.includes(val as (typeof SUPPORTED_CURRENCIES)[number]), {
			message: `Currency code must be a valid ISO 4217 code. Supported codes: ${SUPPORTED_CURRENCIES.join(', ')}`
		})
});

/**
 * GET /api/user/currency
 * Get current user's currency preference
 */
export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ currency: 'USD' }, { status: 200 });
		}

		const currency = await getUserCurrency(session.user.id, request);

		return NextResponse.json({ currency });
	} catch (error) {
		console.error('[API] Error getting user currency:', error);
		return NextResponse.json({ currency: 'USD' }, { status: 200 });
	}
}

/**
 * PUT /api/user/currency
 * Update current user's currency preference
 */
export async function PUT(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();

		// Validate request body with Zod schema
		const validationResult = currencyUpdateSchema.safeParse(body);

		if (!validationResult.success) {
			const errorMessage = validationResult.error.issues[0]?.message || 'Invalid currency code';
			return NextResponse.json({ error: errorMessage }, { status: 400 });
		}

		const { currency } = validationResult.data;

		const success = await updateUserCurrency(session.user.id, currency);

		if (!success) {
			return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 });
		}

		return NextResponse.json({ currency });
	} catch (error) {
		console.error('[API] Error updating user currency:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
