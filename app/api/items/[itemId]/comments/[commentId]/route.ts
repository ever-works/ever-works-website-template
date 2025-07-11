import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteComment } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { comments } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [comment] = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.id, (await params).commentId),
          eq(comments.userId, session.user.id),
          isNull(comments.deletedAt)
        )
      );

    if (!comment) {
      return new NextResponse("Comment not found or not authorized", { status: 404 });
    }

    await deleteComment((await params).commentId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 