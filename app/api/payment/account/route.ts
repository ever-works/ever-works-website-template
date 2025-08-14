import { NextRequest, NextResponse } from 'next/server';
import { setupUserPaymentAccount } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, userId, customerId } = body;
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const paymentAccount = await setupUserPaymentAccount(provider, userId, customerId);

    return NextResponse.json({
      id: paymentAccount.id,
      userId: paymentAccount.userId,
      providerId: paymentAccount.providerId,
      customerId: paymentAccount.customerId,
      createdAt: paymentAccount.createdAt,
      updatedAt: paymentAccount.updatedAt
    });

  } catch (error) {
    console.error('Error setting up payment account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, provider, userId, customerId } = body;
    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const paymentAccount = await setupUserPaymentAccount(provider, userId, customerId);

    return NextResponse.json({
      id: paymentAccount.id,
      userId: paymentAccount.userId,
      providerId: paymentAccount.providerId,
      customerId: paymentAccount.customerId,
      createdAt: paymentAccount.createdAt,
      updatedAt: paymentAccount.updatedAt
    });

  } catch (error) {
    console.error('Error updating payment account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
