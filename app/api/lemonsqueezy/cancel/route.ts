import { auth, PaymentProviderManager } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { subscriptionId, cancelAtPeriodEnd } = await request.json();

    console.log('session', session.user.id);
    const lemonsqueezyProvider = PaymentProviderManager.getLemonsqueezyProvider();

  const subscription = await lemonsqueezyProvider.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
  return NextResponse.json(subscription);
}