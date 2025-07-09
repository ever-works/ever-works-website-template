import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createComment, getCommentsByItemId } from "@/lib/db/queries";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const comments = await getCommentsByItemId(itemId);
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await request.json();
    const { content } = commentSchema.parse(json);

    const comment = await createComment({
      content,
      userId: session.user.id,
      itemId: itemId,
    });

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 