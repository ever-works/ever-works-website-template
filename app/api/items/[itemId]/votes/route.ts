import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    createVote,
    getVoteByUserIdAndItemId,
    getVoteCountForItem,
    deleteVote,
    getClientProfileByUserId
} from "@/lib/db/queries";
import { VoteType } from "@/lib/db/schema";

type RouteParams ={ params: Promise<{ itemId: string }> };

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const [session, { itemId }] = await Promise.all([
      auth(),
      Promise.resolve(context.params)
    ]);

    const count = await getVoteCountForItem(itemId);

    let userVote = null;
    if (session?.user?.id) {
      const clientProfile = await getClientProfileByUserId(session.user.id);
      if (clientProfile) {
        const votes = await getVoteByUserIdAndItemId(clientProfile.id, itemId);
        if (votes.length > 0) {
          userVote = votes[0].voteType === VoteType.UPVOTE ? "up" : "down";
        }
      }
    }

    return NextResponse.json({
      success: true,
      count,
      userVote
    });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
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
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type } = await request.json();

    if (!type || (type !== "up" && type !== "down")) {
      return NextResponse.json(
        { success: false, error: "Invalid vote type. Must be 'up' or 'down'" },
        { status: 400 }
      );
    }

    const clientProfile = await getClientProfileByUserId(session.user.id);
    if (!clientProfile) {
      return NextResponse.json(
        { success: false, error: "Client profile not found" },
        { status: 404 }
      );
    }

    const existingVotes = await getVoteByUserIdAndItemId(clientProfile.id, itemId);
    if (existingVotes.length > 0) {
      await deleteVote(existingVotes[0].id);
    }

    const voteType = type === "up" ? VoteType.UPVOTE : VoteType.DOWNVOTE;
    await createVote({
      userId: clientProfile.id,
      itemId,
      voteType
    });

    const count = await getVoteCountForItem(itemId);

    return NextResponse.json({
      success: true,
      count,
      userVote: type
    });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
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
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clientProfile = await getClientProfileByUserId(session.user.id);
    if (!clientProfile) {
      return NextResponse.json(
        { success: false, error: "Client profile not found" },
        { status: 404 }
      );
    }

    const existingVotes = await getVoteByUserIdAndItemId(clientProfile.id, itemId);
    if (existingVotes.length > 0) {
      await deleteVote(existingVotes[0].id);
    }

    const count = await getVoteCountForItem(itemId);
    return NextResponse.json({
      success: true,
      count,
      userVote: null
    });
  } catch (error) {
    console.error("Error in vote route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 