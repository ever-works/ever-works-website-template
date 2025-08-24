import { auth, PaymentProviderManager } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { subscriptionId, cancelAtPeriodEnd } = (body ?? {}) as {
        subscriptionId?: string;
        cancelAtPeriodEnd?: boolean;
    };
    if (!subscriptionId || typeof subscriptionId !== 'string') {
        return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    try {
        const lemonsqueezyProvider = PaymentProviderManager.getLemonsqueezyProvider();
        const subscription = await lemonsqueezyProvider.cancelSubscription(
            subscriptionId,
            Boolean(cancelAtPeriodEnd)
        );
        return NextResponse.json(subscription, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to cancel subscription: ${error}`, details: error as string }, { status: 502 });
    }
}