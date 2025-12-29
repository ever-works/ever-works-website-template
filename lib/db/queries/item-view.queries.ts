import { db } from '../drizzle';
import { itemViews, type NewItemView } from '../schema';

/**
 * Record an item view with daily deduplication
 *
 * Attempts to insert a view record. If a view already exists for the same
 * item, viewer, and UTC date, the insert is silently ignored (ON CONFLICT DO NOTHING).
 *
 * @param view - View data containing itemId (slug), viewerId, and viewedDateUtc (YYYY-MM-DD)
 * @returns true if a new view was recorded, false if it was a duplicate
 */
export async function recordItemView(
	view: Pick<NewItemView, 'itemId' | 'viewerId' | 'viewedDateUtc'>
): Promise<boolean> {
	const result = await db.insert(itemViews).values(view).onConflictDoNothing().returning({ id: itemViews.id });

	return result.length > 0;
}
