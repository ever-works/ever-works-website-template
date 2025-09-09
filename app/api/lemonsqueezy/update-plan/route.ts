import { auth } from "@/lib/auth";
import { getOrCreateLemonsqueezyProvider } from "@/lib/payment/config/payment-provider-manager";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updatePlanSchema = z.object({
  subscriptionId: z.string().min(1),
  variantId: z.coerce.number().positive('Variant ID must be a positive number'),
  proration: z.enum(['immediate', 'next_period']).optional().default('immediate'),
  invoiceImmediately: z.boolean().optional().default(false),
  disableProrations: z.boolean().optional().default(false),
  billingAnchor: z.number().min(1).max(31).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updatePlanSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.issues,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { subscriptionId, variantId, proration, invoiceImmediately, disableProrations, billingAnchor } = validationResult.data;

    // Initialize LemonSqueezy provider
    const lemonsqueezy = getOrCreateLemonsqueezyProvider();

    // Update the subscription plan
    const result = await lemonsqueezy.updateSubscription({
      subscriptionId,
      priceId: variantId.toString(),
      metadata: {
        action: 'update_plan',
        proration,
        invoiceImmediately,
        disableProrations,
        billingAnchor,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.email
      }
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Subscription plan updated successfully',
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update subscription plan error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/lemonsqueezy/update-plan',
      method: 'POST'
    });
  }

    return NextResponse.json(
      { 
        error: 'Failed to update subscription plan',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'UPDATE_FAILED',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
