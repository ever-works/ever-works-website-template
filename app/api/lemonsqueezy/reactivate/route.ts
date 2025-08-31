import { auth } from "@/lib/auth";
import { getOrCreateLemonsqueezyProvider } from "@/lib/payment/config/payment-provider-manager";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const reactivateSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
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
    const validationResult = reactivateSubscriptionSchema.safeParse(body);
    
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

    const { subscriptionId } = validationResult.data;

    const lemonsqueezy = getOrCreateLemonsqueezyProvider();

    const result = await lemonsqueezy.updateSubscription({
      subscriptionId,
      cancelAtPeriodEnd: false,
      metadata: {
        action: 'reactivate',
        reactivateAction: true,
        reactivatedAt: new Date().toISOString(),
        reactivatedBy: session.user.email
      }
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Subscription reactivated successfully',
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Reactivate subscription error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      endpoint: '/api/lemonsqueezy/subscriptions/reactivate',
      method: 'POST'
    });

    return NextResponse.json(
      { 
        error: 'Failed to reactivate subscription',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'REACTIVATE_FAILED',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
