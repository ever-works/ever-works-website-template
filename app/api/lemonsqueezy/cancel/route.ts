import { auth } from "@/lib/auth";
import { getOrCreateLemonsqueezyProvider } from "@/lib/payment/config/payment-provider-manager";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
  cancelAtPeriodEnd: z.boolean().optional().default(true),
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
    const validationResult = cancelSubscriptionSchema.safeParse(body);
    
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

    const { subscriptionId, cancelAtPeriodEnd } = validationResult.data;

    const lemonsqueezy = getOrCreateLemonsqueezyProvider();

    const result = await lemonsqueezy.cancelSubscription(
      subscriptionId,
      cancelAtPeriodEnd,
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription cancelled immediately',
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Cancel subscription error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/lemonsqueezy/subscriptions/cancel',
      method: 'POST'
    });

    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'CANCEL_FAILED',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
