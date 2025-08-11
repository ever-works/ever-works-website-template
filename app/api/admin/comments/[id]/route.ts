import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteComment, getCommentById } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const comment = await getCommentById(id);
    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteComment(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


