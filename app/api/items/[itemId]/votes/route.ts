import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    createVote,
    getVoteByUserIdAndItemId,
    getVoteCountForItem,
    deleteVote
} from "@/lib/db/queries";
import { VoteType } from "@/lib/db/schema";

type RouteParams = {
  params: {
    itemId: string;
  };
};

export async function GET(
  request: Request,
  params: RouteParams
) {
  try {
    const [session, { itemId }] = await Promise.all([
      auth(),
      Promise.resolve(params.params)
    ]);

    const count = await getVoteCountForItem(itemId);

    let userVote = null;
    if (session?.user?.id) {
      const votes = await getVoteByUserIdAndItemId(session.user.id, itemId);
      if (votes.length > 0) {
        userVote = votes[0].voteType === VoteType.UPVOTE ? "up" : "down";
      }
    }

    return NextResponse.json({ count, userVote });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  params: RouteParams
) {
  try {
    const [session, { itemId }] = await Promise.all([
      auth(),
      Promise.resolve(params.params)
    ]);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type } = await request.json();

    const existingVotes = await getVoteByUserIdAndItemId(session.user.id, itemId);
    if (existingVotes.length > 0) {
      await deleteVote(existingVotes[0].id);
    }

    const voteType = type === "up" ? VoteType.UPVOTE : VoteType.DOWNVOTE;
    await createVote({
      userId: session.user.id,
      itemId,
      voteType
    });

    const count = await getVoteCountForItem(itemId);

    return NextResponse.json({ count, userVote: type });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  params: RouteParams
) {
  try {
    const [session, { itemId }] = await Promise.all([
      auth(),
      Promise.resolve(params.params)
    ]);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingVotes = await getVoteByUserIdAndItemId(session.user.id, itemId);
    if (existingVotes.length > 0) {
      await deleteVote(existingVotes[0].id);
    }

    const count = await getVoteCountForItem(itemId);
    return NextResponse.json({ count, userVote: null });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 