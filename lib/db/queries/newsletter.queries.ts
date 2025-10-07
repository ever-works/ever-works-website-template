import { eq, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  newsletterSubscriptions,
  type NewNewsletterSubscription,
  type NewsletterSubscription
} from '../schema';

/**
 * Create a new newsletter subscription
 * @param email - Subscriber email
 * @param source - Source of subscription (default: 'footer')
 * @returns Created subscription or null on error
 */
export async function createNewsletterSubscription(
  email: string,
  source: string = 'footer'
): Promise<NewsletterSubscription | null> {
  try {
    const newSubscription: NewNewsletterSubscription = {
      email: email.toLowerCase().trim(),
      source
    };

    const result = await db
      .insert(newsletterSubscriptions)
      .values(newSubscription)
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Error creating newsletter subscription:', error);
    return null;
  }
}

/**
 * Get newsletter subscription by email
 * @param email - Subscriber email
 * @returns Subscription or null if not found
 */
export async function getNewsletterSubscriptionByEmail(email: string) {
  try {
    const subscriptions = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .limit(1);

    return subscriptions[0] || null;
  } catch (error) {
    console.error('Error getting newsletter subscription:', error);
    return null;
  }
}

/**
 * Update newsletter subscription
 * @param email - Subscriber email
 * @param updates - Fields to update
 * @returns Updated subscription or null on error
 */
export async function updateNewsletterSubscription(
  email: string,
  updates: Partial<Pick<NewsletterSubscription, 'isActive' | 'unsubscribedAt'>>
) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set(updates)
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Error updating newsletter subscription:', error);
    return null;
  }
}

/**
 * Unsubscribe from newsletter
 * @param email - Subscriber email
 * @returns Updated subscription or null on error
 */
export async function unsubscribeFromNewsletter(email: string) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set({
        isActive: false,
        unsubscribedAt: new Date()
      })
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return null;
  }
}

/**
 * Resubscribe to newsletter
 * @param email - Subscriber email
 * @returns Updated subscription or null on error
 */
export async function resubscribeToNewsletter(email: string) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set({
        isActive: true,
        unsubscribedAt: null
      })
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Error resubscribing to newsletter:', error);
    return null;
  }
}

/**
 * Get newsletter statistics
 * @returns Statistics about newsletter subscriptions
 */
export async function getNewsletterStats() {
  try {
    const totalSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.isActive, true));

    const recentSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscriptions)
      .where(sql`${newsletterSubscriptions.subscribedAt} >= NOW() - INTERVAL '30 days'`);

    return {
      totalActive: totalSubscriptions[0]?.count || 0,
      recentSubscriptions: recentSubscriptions[0]?.count || 0
    };
  } catch (error) {
    console.error('Error getting newsletter stats:', error);
    return {
      totalActive: 0,
      recentSubscriptions: 0
    };
  }
}
