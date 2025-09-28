import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentsByItemId, createComment, getClientProfileByUserId } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
   const itemComments = await getCommentsByItemId((await params).itemId);

    return NextResponse.json({
      success: true,
      comments: itemComments
    });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { content, rating } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const clientProfile = await getClientProfileByUserId(session.user.id!);
    if (!clientProfile) {
      return NextResponse.json(
        { success: false, error: "Client profile not found" },
        { status: 404 }
      );
    }

    const comment = await createComment({
      content,
      rating,
      userId: clientProfile.id,
      itemId: (await params).itemId,
    });

    const itemComments = await getCommentsByItemId((await params).itemId);
    const commentWithUser = itemComments.find((c) => c.id === comment.id);

    return NextResponse.json({
      success: true,
      comment: commentWithUser
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
      { status: 500 }
    );
  }
} 