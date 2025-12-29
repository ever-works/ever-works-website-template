import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserCurrency, updateUserCurrency } from '@/lib/services/currency.service';

/**
 * GET /api/user/currency
 * Get current user's currency preference
 */
export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		
		if (!session?.user?.id) {
			return NextResponse.json({ currency: 'USD' }, { status: 200 });
		}
		
		const currency = await getUserCurrency(session.user.id, request);
		
		return NextResponse.json({ currency });
	} catch (error) {
		console.error('[API] Error getting user currency:', error);
		return NextResponse.json({ currency: 'USD' }, { status: 200 });
	}
}

/**
 * PUT /api/user/currency
 * Update current user's currency preference
 */
export async function PUT(request: NextRequest) {
	try {
		const session = await auth();
		
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		
		const body = await request.json();
		const { currency } = body;
		
		if (!currency || typeof currency !== 'string') {
			return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
		}
		
		const success = await updateUserCurrency(session.user.id, currency);
		
		if (!success) {
			return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 });
		}
		
		return NextResponse.json({ currency: currency.toUpperCase() });
	} catch (error) {
		console.error('[API] Error updating user currency:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

