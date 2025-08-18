import { NextResponse } from 'next/server';
import { auth, getOrCreateStripeProvider } from '@/lib/auth';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const stripeProvider = getOrCreateStripeProvider();

    // Create setup intent
    const setupIntent = await stripeProvider.createSetupIntent(session.user as any);

    return NextResponse.json(setupIntent);
  } catch (error) {
    console.error('Setup intent creation error:', error);
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 });
  }
} 