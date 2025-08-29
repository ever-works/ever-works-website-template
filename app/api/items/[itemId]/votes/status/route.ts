import { auth } from '@/lib/auth';
import { getVoteByUserIdAndItemId, getClientProfileByUserId } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { itemId } = await context.params;
    const clientProfile = await getClientProfileByUserId(session.user.id);
    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }
    
    const votes = await getVoteByUserIdAndItemId(clientProfile.id, itemId);
    return NextResponse.json(votes[0] || null);
  } catch (error) {
    console.error('Error fetching vote status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote status' },
      { status: 500 }
    );
  }
} 