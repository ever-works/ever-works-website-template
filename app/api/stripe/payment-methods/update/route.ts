import { auth, initializeStripeProvider } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updatePaymentMethodSchema = z.object({
	payment_method_id: z.string().min(1, 'Payment method ID is required'),
	metadata: z.record(z.string(), z.string()).optional(),
	billing_details: z
		.object({
			name: z.string().min(1, 'Name cannot be empty').optional(),
			email: z.string().email({ message: 'Invalid email format' }).optional(),
			phone: z.string().optional(),
			address: z
				.object({
					line1: z.string().optional(),
					line2: z.string().optional(),
					city: z.string().optional(),
					state: z.string().optional(),
					postal_code: z.string().optional(),
					country: z.string().length(2, 'Country must be a 2-letter code').optional()
				})
				.optional()
		})
		.optional(),
	card: z
		.object({
			exp_month: z.number().int().min(1).max(12).optional(),
			exp_year: z
				.number()
				.int()
				.min(new Date().getFullYear())
				.max(new Date().getFullYear() + 20)
				.optional()
		})
		.optional(),
	set_as_default: z.boolean().optional()
});

const setDefaultPaymentMethodSchema = z.object({
	payment_method_id: z.string().min(1, 'Payment method ID is required')
});

// ============================================================================
// TYPES
// ============================================================================

interface PaymentMethodResponse {
	id: string;
	type: string;
	card: {
		brand: string;
		last4: string;
		exp_month: number;
		exp_year: number;
		funding: string;
	} | null;
	billing_details: Stripe.PaymentMethod.BillingDetails | null;
	created: number;
	metadata: Stripe.Metadata | null;
	is_default?: boolean;
}

interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	details?: any;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates user session and returns user ID
 */
async function validateSession(): Promise<{ userId: string } | NextResponse> {
	const session = await auth();

	if (!session?.user?.id) {
		return NextResponse.json<ApiResponse>({ success: false, error: 'Authentication required' }, { status: 401 });
	}

	return { userId: session.user.id };
}

/**
 * Validates payment method ownership
 */
async function validatePaymentMethodOwnership(
	paymentMethodId: string,
	userId: string
): Promise<{ paymentMethod: Stripe.PaymentMethod; customer: Stripe.Customer } | NextResponse> {
	try {
		const stripeProvider = initializeStripeProvider();
		const stripe = stripeProvider.getStripeInstance();
		// Retrieve payment method
		const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

		if (!paymentMethod.customer) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: 'Payment method not associated with a customer' },
				{ status: 400 }
			);
		}

		// Retrieve customer
		const customer = await stripe.customers.retrieve(paymentMethod.customer as string);

		if (typeof customer === 'string' || customer.deleted) {
			return NextResponse.json<ApiResponse>({ success: false, error: 'Customer not found' }, { status: 404 });
		}

		// Verify ownership
		if (customer.metadata?.userId !== userId) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: 'Access denied: payment method does not belong to user' },
				{ status: 403 }
			);
		}

		return { paymentMethod, customer };
	} catch (error) {
		if (error instanceof Stripe.errors.StripeError) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: `Stripe error: ${error.message}` },
				{ status: 400 }
			);
		}
		throw error;
	}
}

/**
 * Formats payment method for API response
 */
function formatPaymentMethodResponse(paymentMethod: Stripe.PaymentMethod, isDefault = false): PaymentMethodResponse {
	return {
		id: paymentMethod.id,
		type: paymentMethod.type,
		card: paymentMethod.card
			? {
					brand: paymentMethod.card.brand,
					last4: paymentMethod.card.last4,
					exp_month: paymentMethod.card.exp_month,
					exp_year: paymentMethod.card.exp_year,
					funding: paymentMethod.card.funding
				}
			: null,
		billing_details: paymentMethod.billing_details,
		created: paymentMethod.created,
		metadata: paymentMethod.metadata,
		is_default: isDefault
	};
}

/**
 * Handles API errors consistently
 */
function handleApiError(error: unknown, operation: string): NextResponse {
	console.error(`Error in ${operation}:`, error);

	if (error instanceof z.ZodError) {
		return NextResponse.json<ApiResponse>(
			{
				success: false,
				error: 'Invalid request data',
				details: error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message
				}))
			},
			{ status: 400 }
		);
	}

	if (error instanceof Stripe.errors.StripeError) {
		const statusCode = error.statusCode || 400;
		return NextResponse.json<ApiResponse>(
			{ success: false, error: `Stripe error: ${error.message}` },
			{ status: statusCode }
		);
	}

	return NextResponse.json<ApiResponse>({ success: false, error: `Failed to ${operation}` }, { status: 500 });
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * PUT - Update a payment method
 * Updates billing details, card information, and optionally sets as default
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
	try {
		// Validate session
		const sessionResult = await validateSession();
		if (sessionResult instanceof NextResponse) {
			return sessionResult;
		}
		const stripeProvider = initializeStripeProvider();
		const stripe = stripeProvider.getStripeInstance();
		const { userId } = sessionResult;

		// Parse and validate request body
		const body = await request.json();
		const validatedData = updatePaymentMethodSchema.parse(body);
		const { payment_method_id, metadata, billing_details, card, set_as_default } = validatedData;

		// Validate payment method ownership
		const ownershipResult = await validatePaymentMethodOwnership(payment_method_id, userId);
		if (ownershipResult instanceof NextResponse) {
			return ownershipResult;
		}
		const { paymentMethod, customer } = ownershipResult;

		// Prepare update data
		const updateData: Stripe.PaymentMethodUpdateParams = {};

		// Update metadata if provided
		if (metadata) {
			updateData.metadata = {
				...paymentMethod.metadata,
				...metadata,
				userId // Ensure userId is always present
			};
		}

		// Update billing details if provided
		if (billing_details) {
			updateData.billing_details = billing_details;
		}

		// Note: Card details (exp_month, exp_year) cannot be updated via Stripe API
		// This is a Stripe limitation for security reasons
		if (card) {
			console.warn('Card details cannot be updated via Stripe API for security reasons');
		}

		// Update the payment method
		const updatedPaymentMethod = await stripe.paymentMethods.update(payment_method_id, updateData);

		// Set as default if requested
		let isDefault = false;
		if (set_as_default) {
			await stripe.customers.update(customer.id, {
				invoice_settings: {
					default_payment_method: payment_method_id
				}
			});
			isDefault = true;
		}

		// Format and return response
		const formattedPaymentMethod = formatPaymentMethodResponse(updatedPaymentMethod, isDefault);

		return NextResponse.json<ApiResponse<PaymentMethodResponse>>({
			success: true,
			data: formattedPaymentMethod,
			message: 'Payment method updated successfully'
		});
	} catch (error) {
		return handleApiError(error, 'update payment method');
	}
}

/**
 * PATCH - Set payment method as default
 * Sets the specified payment method as the default for the customer
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
	try {
		// Validate session
		const sessionResult = await validateSession();
		if (sessionResult instanceof NextResponse) {
			return sessionResult;
		}

		const { userId } = sessionResult;
		const stripeProvider = initializeStripeProvider();
		const stripe = stripeProvider.getStripeInstance();
		// Parse and validate request body
		const body = await request.json();
		const { payment_method_id } = setDefaultPaymentMethodSchema.parse(body);

		// Validate payment method ownership
		const ownershipResult = await validatePaymentMethodOwnership(payment_method_id, userId);
		if (ownershipResult instanceof NextResponse) {
			return ownershipResult;
		}
		const { customer } = ownershipResult;

		// Set as default payment method
		await stripe.customers.update(customer.id, {
			invoice_settings: {
				default_payment_method: payment_method_id
			}
		});

		return NextResponse.json<ApiResponse>({
			success: true,
			message: 'Payment method set as default successfully'
		});
	} catch (error) {
		return handleApiError(error, 'set default payment method');
	}
}
