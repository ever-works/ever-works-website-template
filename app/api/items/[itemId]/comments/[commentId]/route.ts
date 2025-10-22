import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteComment, getClientProfileByUserId } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { comments } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { checkDatabaseAvailability } from "@/lib/utils/database-check";

/**
 * @swagger
 * /api/items/{itemId}/comments/{commentId}:
 *   delete:
 *     tags: ["Item Comments"]
 *     summary: "Delete comment"
 *     description: "Deletes a specific comment. Only the comment author can delete their own comment. The comment is soft-deleted (marked as deleted) rather than permanently removed from the database. Requires user authentication and ownership verification."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "itemId"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Item ID that the comment belongs to"
 *         example: "item_123abc"
 *       - name: "commentId"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Comment ID to delete"
 *         example: "comment_456def"
 *     responses:
 *       204:
 *         description: "Comment deleted successfully (no content returned)"
 *       401:
 *         description: "Unauthorized - Authentication required"
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized"
 *       404:
 *         description: "Comment not found, client profile not found, or not authorized to delete"
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 client_not_found: "Client profile not found"
 *                 comment_not_found: "Comment not found or not authorized"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Internal Server Error"
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string; commentId: string }> }
) {
  // Check database availability
  const dbCheck = checkDatabaseAvailability();
  if (dbCheck) return dbCheck;

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const clientProfile = await getClientProfileByUserId(session.user.id);
    if (!clientProfile) {
      return new NextResponse("Client profile not found", { status: 404 });
    }

    const [comment] = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.id, (await params).commentId),
          eq(comments.userId, clientProfile.id),
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