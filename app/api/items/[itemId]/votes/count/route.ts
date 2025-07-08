import { getVoteCountForItem } from '@/lib/db/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { itemId: string } }
) {
  try {
    const count = await getVoteCountForItem(context.params.itemId);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching vote count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote count' },
      { status: 500 }
    );
  }
} 