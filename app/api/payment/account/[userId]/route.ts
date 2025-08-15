import { NextRequest, NextResponse } from 'next/server';
import { getUserPaymentAccountByProvider } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    const paymentAccount = await getUserPaymentAccountByProvider(userId, provider);

    if (!paymentAccount) {
      return NextResponse.json(
        { error: 'Payment account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: paymentAccount.id,
      userId: paymentAccount.userId,
      providerId: paymentAccount.providerId,
      customerId: paymentAccount.customerId,
      accountId: paymentAccount.accountId,
      lastUsed: paymentAccount.lastUsed,
      createdAt: paymentAccount.createdAt,
      updatedAt: paymentAccount.updatedAt
    });

  } catch (error) {
    console.error('Error fetching payment account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
