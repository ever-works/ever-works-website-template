import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { updateUserCurrency } from '@/lib/services/currency.service';
import { SUPPORTED_CURRENCIES } from '@/lib/config/billing';
import {
	CountryHeaderProvider,
	getCountryFromHeaders,
	getCurrencyFromCountry
} from '@/lib/services/currency-detection.service';
import { Logger } from '@/lib/logger';
const logger = Logger.create('currencyService');

const currencyUpdateSchema = z.object({
	currency: z
		.string()
		.trim()
		.min(1, 'Currency code is required')
		.max(3, 'Currency code must be 3 characters')
		.toUpperCase()
		.refine((val) => SUPPORTED_CURRENCIES.includes(val as (typeof SUPPORTED_CURRENCIES)[number]), {
			message: `Currency code must be a valid ISO 4217 code. Supported codes: ${SUPPORTED_CURRENCIES.join(', ')}`
		}),
	country: z
		.string()
		.trim()
		.min(1, 'Country code is required')
		.max(2, 'Country code must be 2 characters')
		.toUpperCase()
});

/**
 * GET /api/user/currency
 * Get current user's currency preference
 */
export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ currency: 'USD', country: 'US' }, { status: 200 });
		}
		const { searchParams } = new URL(request.url);
		const provider = (searchParams.get('provider') || 'smart') as CountryHeaderProvider;
		const headers = request.headers;

		const detectedCountry = getCountryFromHeaders(headers, provider);
		const currency = detectedCountry ? getCurrencyFromCountry(detectedCountry) : 'USD';

		console.log('detectedCountry', detectedCountry, 'currency', currency);

		return NextResponse.json({ currency, country: detectedCountry });
	} catch (error) {
		logger.error('Error getting user currency:', error);
		return NextResponse.json({ currency: 'USD', country: 'US' }, { status: 200 });
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

		// Parse and validate JSON body
		let body: unknown;
		try {
			body = await request.json();
		} catch (parseError) {
			logger.error('Invalid JSON in currency update request:', parseError);
			return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
		}

		// Validate request body with Zod schema
		const validationResult = currencyUpdateSchema.safeParse(body);

		if (!validationResult.success) {
			const errorMessage = validationResult.error.issues[0]?.message || 'Invalid currency code';
			return NextResponse.json({ error: errorMessage }, { status: 400 });
		}

		const { currency, country } = validationResult.data;

		const success = await updateUserCurrency(session.user.id, currency, country);

		if (!success) {
			return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 });
		}

		return NextResponse.json({ currency, country });
	} catch (error) {
		logger.error('Error updating user currency:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
