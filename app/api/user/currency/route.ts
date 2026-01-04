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
 * @swagger
 * /api/user/currency:
 *   get:
 *     tags: ["User - Currency"]
 *     summary: "Get user's currency preference"
 *     description: "Detects and returns the user's currency preference based on HTTP headers (Cloudflare, Vercel, CloudFront, etc.) or defaults to USD. Supports multiple detection providers for accurate country-based currency detection."
 *     parameters:
 *       - name: "provider"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["cloudflare", "vercel", "cloudfront", "fastly", "generic", "auto", "smart"]
 *           default: "smart"
 *         description: "Country detection provider to use. 'smart' automatically detects the best available provider."
 *         example: "smart"
 *     responses:
 *       200:
 *         description: "Currency preference retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currency:
 *                   type: string
 *                   description: "ISO 4217 currency code (3 characters)"
 *                   example: "USD"
 *                 country:
 *                   type: string
 *                   nullable: true
 *                   description: "ISO 3166-1 alpha-2 country code (2 characters) or null if detection failed"
 *                   example: "US"
 *               required: ["currency"]
 *             examples:
 *               us_user:
 *                 summary: "US user"
 *                 value:
 *                   currency: "USD"
 *                   country: "US"
 *               eu_user:
 *                 summary: "EU user"
 *                 value:
 *                   currency: "EUR"
 *                   country: "FR"
 *               default:
 *                 summary: "Default fallback"
 *                 value:
 *                   currency: "USD"
 *                   country: "US"
 *       500:
 *         description: "Internal server error - defaults to USD"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currency:
 *                   type: string
 *                   example: "USD"
 *                 country:
 *                   type: string
 *                   example: "US"
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const provider = (searchParams.get('provider') || 'smart') as CountryHeaderProvider;
		const headers = request.headers;
		const detectedCountry = getCountryFromHeaders(headers, provider);
		const currency = detectedCountry ? getCurrencyFromCountry(detectedCountry) : 'USD';
		return NextResponse.json({ currency, country: detectedCountry });
	} catch (error) {
		logger.error('Error getting user currency:', error);
		return NextResponse.json({ currency: 'USD', country: 'US' }, { status: 200 });
	}
}

/**
 * @swagger
 * /api/user/currency:
 *   put:
 *     tags: ["User - Currency"]
 *     summary: "Update user's currency preference"
 *     description: "Updates the authenticated user's currency and country preference. Requires valid authentication session. Currency code must be a valid ISO 4217 code from the supported currencies list."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 3
 *                 description: "ISO 4217 currency code (3 characters, uppercase)"
 *                 example: "EUR"
 *               country:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2
 *                 description: "ISO 3166-1 alpha-2 country code (2 characters, uppercase)"
 *                 example: "FR"
 *             required: ["currency", "country"]
 *           examples:
 *             euro:
 *               summary: "Set to Euro"
 *               value:
 *                 currency: "EUR"
 *                 country: "FR"
 *             usd:
 *               summary: "Set to US Dollar"
 *               value:
 *                 currency: "USD"
 *                 country: "US"
 *             gbp:
 *               summary: "Set to British Pound"
 *               value:
 *                 currency: "GBP"
 *                 country: "GB"
 *     responses:
 *       200:
 *         description: "Currency preference updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currency:
 *                   type: string
 *                   description: "Updated ISO 4217 currency code"
 *                   example: "EUR"
 *                 country:
 *                   type: string
 *                   description: "Updated ISO 3166-1 alpha-2 country code"
 *                   example: "FR"
 *               required: ["currency", "country"]
 *             example:
 *               currency: "EUR"
 *               country: "FR"
 *       400:
 *         description: "Bad request - Invalid JSON payload or validation error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Error message describing the validation failure"
 *             examples:
 *               invalid_json:
 *                 summary: "Invalid JSON"
 *                 value:
 *                   error: "Invalid JSON payload"
 *               invalid_currency:
 *                 summary: "Invalid currency code"
 *                 value:
 *                   error: "Currency code must be a valid ISO 4217 code. Supported codes: USD, EUR, GBP, JPY, CNY, CAD, AUD, CHF, INR, BRL, MXN, KRW, RUB, TRY, ZAR, SGD, HKD, NOK, SEK, DKK, PLN, CZK, HUF, NZD, THB, ILS, CLP, PHP, AED, ..."
 *               invalid_country:
 *                 summary: "Invalid country code"
 *                 value:
 *                   error: "Country code is required"
 *       401:
 *         description: "Unauthorized - User not authenticated"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: "Internal server error - Failed to update currency"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update currency"
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
