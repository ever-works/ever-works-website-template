import { getVoteCountForItem } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await context.params;
    const count = await getVoteCountForItem(itemId);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching vote count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote count' },
      { status: 500 }
    );
  }
} 