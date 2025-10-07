import { and, eq, isNull, desc } from 'drizzle-orm';
import { db } from '../drizzle';
import { comments, clientProfiles, type NewComment } from '../schema';
import type { CommentWithUser } from './types';

/**
 * Create a new comment
 * @param data - Comment data
 * @returns Created comment
 */
export async function createComment(data: NewComment) {
  return (await db.insert(comments).values(data).returning())[0];
}

/**
 * Get comments by item ID with user information
 * @param itemId - Item ID
 * @returns Array of comments with user details
 */
export async function getCommentsByItemId(itemId: string): Promise<CommentWithUser[]> {
  return db
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
        image: clientProfiles.avatar
      }
    })
    .from(comments)
    .innerJoin(clientProfiles, eq(comments.userId, clientProfiles.id))
    .where(and(eq(comments.itemId, itemId), isNull(comments.deletedAt)))
    .orderBy(desc(comments.createdAt));
}

/**
 * Get comment by ID
 * @param id - Comment ID
 * @returns Comment or undefined
 */
export async function getCommentById(id: string) {
  return (await db.select().from(comments).where(eq(comments.id, id)).limit(1))[0];
}

/**
 * Update comment content
 * @param id - Comment ID
 * @param content - New content
 * @returns Updated comment
 */
export async function updateComment(id: string, content: string) {
  const [comment] = await db
    .update(comments)
    .set({ content, updatedAt: new Date() })
    .where(eq(comments.id, id))
    .returning();

  return comment;
}

/**
 * Update comment rating
 * @param id - Comment ID
 * @param rating - New rating
 * @returns Updated comment
 */
export async function updateCommentRating(id: string, rating: number) {
  return (await db.update(comments).set({ rating }).where(eq(comments.id, id)).returning())[0];
}

/**
 * Soft delete a comment
 * @param id - Comment ID
 * @returns Deleted comment
 */
export async function deleteComment(id: string) {
  const [comment] = await db
    .update(comments)
    .set({ deletedAt: new Date() })
    .where(eq(comments.id, id))
    .returning();

  return comment;
}
