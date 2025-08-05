import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { StripeProvider } from '@/lib/payment/lib/providers/stripe-provider';
import { createProviderConfigs } from '@/lib/payment/config/provider-configs';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    // Initialize Stripe provider
    const configs = createProviderConfigs({
      apiKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      options: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        apiVersion: '2023-10-16'
      }
    });

    const stripeProvider = new StripeProvider(configs.stripe);

    // Create setup intent
    const setupIntent = await stripeProvider.createSetupIntent(session.user as any);

    return NextResponse.json(setupIntent);
  } catch (error) {
    console.error('Setup intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 });
  }
} 