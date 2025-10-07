import { and, eq, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import { votes, type InsertVote } from '../schema';

/**
 * Create a new vote
 * @param vote - Vote data
 * @returns Created vote
 */
export async function createVote(vote: InsertVote) {
  return db.insert(votes).values(vote).returning();
}

/**
 * Get vote by user ID and item ID
 * @param userId - User ID
 * @param itemId - Item ID
 * @returns Vote array (empty if not found)
 */
export async function getVoteByUserIdAndItemId(userId: string, itemId: string) {
  return db
    .select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.itemId, itemId)))
    .limit(1);
}

/**
 * Delete a vote
 * @param voteId - Vote ID to delete
 */
export async function deleteVote(voteId: string) {
  return db.delete(votes).where(eq(votes.id, voteId));
}

/**
 * Get items sorted by vote count
 * @param limit - Number of items to return
 * @param offset - Offset for pagination
 * @returns Items with vote counts
 */
export async function getItemsSortedByVotes(limit: number = 10, offset: number = 0) {
  const itemsWithVotes = await db
    .select({
      itemId: votes.itemId,
      voteCount: sql<number>`count(${votes.id})`.as('vote_count')
    })
    .from(votes)
    .groupBy(votes.itemId)
    .orderBy(sql`vote_count DESC`)
    .limit(limit)
    .offset(offset);

  return itemsWithVotes;
}

/**
 * Get the net vote score for an item (upvotes - downvotes)
 * @param itemId - The item ID to get the vote score for
 * @returns Net vote score (positive = more upvotes, negative = more downvotes, 0 = equal or no votes)
 */
export async function getVoteCountForItem(itemId: string): Promise<number> {
  const [result] = await db
    .select({
      netScore: sql<number>`
        SUM(CASE
          WHEN vote_type = 'upvote' THEN 1
          WHEN vote_type = 'downvote' THEN -1
          ELSE 0
        END)
      `.as('netScore')
    })
    .from(votes)
    .where(eq(votes.itemId, itemId));

  return Number(result?.netScore || 0);
}
