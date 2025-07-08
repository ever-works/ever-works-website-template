import { auth } from '@/lib/auth';
import { createVote, deleteVote, getVoteByUserIdAndItemId, getVoteCountForItem } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { VoteType } from '@/lib/db/schema';

export async function POST(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has already voted
    const existingVotes = await getVoteByUserIdAndItemId(session.user.id, params.itemId);
    if (existingVotes.length > 0) {
      return NextResponse.json(
        { error: 'You have already voted for this item' },
        { status: 400 }
      );
    }

    // Add vote
    const [vote] = await createVote({
      userId: session.user.id,
      itemId: params.itemId,
      voteType: VoteType.UPVOTE,
    });

    // Get updated vote count
    const voteCount = await getVoteCountForItem(params.itemId);

    return NextResponse.json({
      success: true,
      message: 'Vote added successfully',
      voteCount,
      vote,
    });
  } catch (error) {
    console.error('Error adding vote:', error);
    return NextResponse.json(
      { error: 'Failed to add vote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's vote
    const existingVotes = await getVoteByUserIdAndItemId(session.user.id, params.itemId);
    if (existingVotes.length === 0) {
      return NextResponse.json(
        { error: 'No vote found to remove' },
        { status: 404 }
      );
    }

    // Delete vote
    await deleteVote(existingVotes[0].id);

    // Get updated vote count
    const voteCount = await getVoteCountForItem(params.itemId);

    return NextResponse.json({
      success: true,
      message: 'Vote removed successfully',
      voteCount,
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
} 