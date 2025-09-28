import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteComment, getCommentById, updateComment } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { comments, clientProfiles } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get comment with user information
    const result = await db
      .select({
        id: comments.id,
        content: comments.content,
        rating: comments.rating,
        userId: comments.userId,
        itemId: comments.itemId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: clientProfiles.id,
          name: clientProfiles.name,
          email: clientProfiles.email,
          image: clientProfiles.avatar,
        },
      })
      .from(comments)
      .leftJoin(clientProfiles, eq(comments.userId, clientProfiles.id))
      .where(eq(comments.id, id))
      .limit(1);

    if (result.length === 0 || result[0].createdAt === null) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    const comment = result[0];
    const responseData = {
      id: comment.id,
      content: comment.content ?? "",
      rating: comment.rating ?? null,
      userId: comment.userId ?? "",
      itemId: comment.itemId ?? "",
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user
        ? {
            id: comment.user.id ?? "",
            name: comment.user.name ?? null,
            email: comment.user.email ?? null,
            image: comment.user.image ?? null,
          }
        : {
            id: "",
            name: "Unknown User",
            email: "",
            image: null,
          },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Failed to get comment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    // Check if comment exists and is not deleted
    const existingComment = await getCommentById(id);
    if (!existingComment || existingComment.deletedAt) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    // Update comment
    const updatedComment = await updateComment(id, content);

    // Get updated comment with user information
    const result = await db
      .select({
        id: comments.id,
        content: comments.content,
        rating: comments.rating,
        userId: comments.userId,
        itemId: comments.itemId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: clientProfiles.id,
          name: clientProfiles.name,
          email: clientProfiles.email,
          image: clientProfiles.avatar,
        },
      })
      .from(comments)
      .leftJoin(clientProfiles, eq(comments.userId, clientProfiles.id))
      .where(eq(comments.id, id))
      .limit(1);

    const comment = result[0];
    const responseData = {
      id: comment.id,
      content: comment.content ?? "",
      rating: comment.rating ?? null,
      userId: comment.userId ?? "",
      itemId: comment.itemId ?? "",
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user
        ? {
            id: comment.user.id ?? "",
            name: comment.user.name ?? null,
            email: comment.user.email ?? null,
            image: comment.user.image ?? null,
          }
        : {
            id: "",
            name: "Unknown User",
            email: "",
            image: null,
          },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Failed to update comment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const comment = await getCommentById(id);
    if (!comment || comment.deletedAt) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }

    await deleteComment(id);
    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}


