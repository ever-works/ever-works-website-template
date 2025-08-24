import { NextRequest, NextResponse } from 'next/server';
import { validateCheckoutRequestBody, validateCheckoutQueryParams } from '@/lib/payment/config/validation';
import {
    HTTP_STATUS,
    ERROR_TYPES,
    CreateCheckoutResponse,
    CreateCheckoutError
} from '@/lib/payment/config/types';
import { auth, getOrCreateLemonsqueezyProvider, PaymentProviderManager } from '@/lib/auth';


export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({
                error: ERROR_TYPES.INTERNAL_ERROR,
                message: 'Unauthorized'
            }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR })
        }
        let body: any;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    error: ERROR_TYPES.VALIDATION_ERROR,
                    message: 'Invalid JSON in request body'
                } as CreateCheckoutError,
                { status: HTTP_STATUS.BAD_REQUEST }
            );
        }
        const lemonsqueezyProvider = getOrCreateLemonsqueezyProvider();
        const validation = validateCheckoutRequestBody(body);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: ERROR_TYPES.VALIDATION_ERROR,
                    message: validation.errors.join(', ')
                } as CreateCheckoutError,
                { status: HTTP_STATUS.BAD_REQUEST }
            );
        }

        const checkoutUrl = await lemonsqueezyProvider.createCustomCheckout({
            email: session.user.email!,
            customPrice: body.customPrice,
            variantId: body.variantId,
            metadata: {
                ...body.metadata,
                userId: session.user.id,
                email: session.user.email!,
                name: session.user.name!
            },
        });

        const response: CreateCheckoutResponse = {
            success: true,
            data: {
                checkoutUrl,
                email: session.user.email!,
                customPrice: body.customPrice,
                variantId: body.variantId,
                metadata: {
                    ...body.metadata,
                    userId: session.user.id,
                    email: session.user.email!,
                    name: session.user.name!
                },
            },
            message: 'Checkout session created successfully',
        };

        return NextResponse.json(response, { status: HTTP_STATUS.OK });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Missing required environment variables')) {
                return NextResponse.json(
                    {
                        error: ERROR_TYPES.CONFIGURATION_ERROR,
                        message: 'Checkout service unavailable'
                    } as CreateCheckoutError,
                    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
                );
            }

            if (error.message.includes('Invalid email format')) {
                return NextResponse.json(
                    {
                        error: ERROR_TYPES.VALIDATION_ERROR,
                        message: error.message
                    } as CreateCheckoutError,
                    { status: HTTP_STATUS.BAD_REQUEST }
                );
            }

            if (error.message.includes('Custom price must be')) {
                return NextResponse.json(
                    {
                        error: ERROR_TYPES.VALIDATION_ERROR,
                        message: error.message
                    } as CreateCheckoutError,
                    { status: HTTP_STATUS.BAD_REQUEST }
                );
            }

            if (error.message.includes('Lemonsqueezy')) {
                return NextResponse.json(
                    {
                        error: ERROR_TYPES.PAYMENT_SERVICE_ERROR,
                        message: 'Unable to create checkout session'
                    } as CreateCheckoutError,
                    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
                );
            }
        }

        return NextResponse.json(
            {
                error: ERROR_TYPES.INTERNAL_ERROR,
                message: 'Failed to create checkout session'
            } as CreateCheckoutError,
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const validation = validateCheckoutQueryParams(searchParams);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: ERROR_TYPES.VALIDATION_ERROR,
                    message: validation.errors.join(', ')
                } as CreateCheckoutError,
                { status: HTTP_STATUS.BAD_REQUEST }
            );
        }

        const lemonsqueezyProvider = PaymentProviderManager.getLemonsqueezyProvider();
        const checkoutUrl = await lemonsqueezyProvider.createCustomCheckout(validation.data!);

        const response: CreateCheckoutResponse = {
            success: true,
            data: {
                checkoutUrl,
                email: validation.data!.email,
                customPrice: validation.data!.customPrice,
                variantId: validation.data!.variantId,
                metadata: validation.data!.metadata,
            },
            message: 'Checkout session created successfully',
        };

        return NextResponse.json(response, { status: HTTP_STATUS.OK });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Missing required environment variables')) {
                return NextResponse.json(
                    {
                        error: ERROR_TYPES.CONFIGURATION_ERROR,
                        message: 'Checkout service unavailable'
                    } as CreateCheckoutError,
                    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
                );
            }

            if (error.message.includes('Lemonsqueezy')) {
                return NextResponse.json(
                    {
                        error: ERROR_TYPES.PAYMENT_SERVICE_ERROR,
                        message: 'Unable to create checkout session'
                    } as CreateCheckoutError,
                    { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
                );
            }
        }

        return NextResponse.json(
            {
                error: ERROR_TYPES.INTERNAL_ERROR,
                message: 'Failed to create checkout session'
            } as CreateCheckoutError,
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
