import { getVoteCountForItem } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

type RouteParams = {
  params: {
    itemId: string;
  };
};

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const count = await getVoteCountForItem(params.itemId);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching vote count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote count' },
      { status: 500 }
    );
  }
} 