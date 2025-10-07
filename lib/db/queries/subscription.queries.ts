import { and, eq, desc, asc, lte, count } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  subscriptions,
  subscriptionHistory,
  users,
  SubscriptionStatus,
  type Subscription,
  type NewSubscription,
  type SubscriptionHistory as SubscriptionHistoryType,
  type NewSubscriptionHistory,
  type SubscriptionWithUser
} from '../schema';
import { PaymentPlan } from '@/lib/constants';

/**
 * Get active subscription for a user
 * @param userId - User ID
 * @returns Active subscription or null if not found
 */
export async function getUserActiveSubscription(userId: string): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, SubscriptionStatus.ACTIVE)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get all subscriptions for a user
 * @param userId - User ID
 * @returns Array of user subscriptions ordered by creation date
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
}

/**
 * Get subscription by provider subscription ID
 * @param paymentProvider - Payment provider name
 * @param subscriptionId - Provider's subscription ID
 * @returns Subscription or null if not found
 */
export async function getSubscriptionByProviderSubscriptionId(
  paymentProvider: string,
  subscriptionId: string
): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(eq(subscriptions.paymentProvider, paymentProvider), eq(subscriptions.subscriptionId, subscriptionId))
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get subscription by user ID and subscription ID
 * @param userId - User ID
 * @param subscriptionId - Provider's subscription ID
 * @returns Subscription or null if not found
 */
export async function getSubscriptionByUserIdAndSubscriptionId(
  userId: string,
  subscriptionId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.subscriptionId, subscriptionId)));

  return subscription || null;
}

/**
 * Update subscription by subscription ID
 * @param updateData - Partial subscription data including subscriptionId
 * @returns Updated subscription or null if not found
 */
export async function updateSubscriptionBySubscriptionId(
  updateData: Partial<NewSubscription>
): Promise<Subscription | null> {
  const result = await db
    .update(subscriptions)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(subscriptions.subscriptionId, updateData.subscriptionId!));

  return result[0] || null;
}

/**
 * Create a new subscription
 * @param data - Subscription data
 * @returns Created subscription
 */
export async function createSubscription(data: NewSubscription): Promise<Subscription> {
  const result = await db
    .insert(subscriptions)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  return result[0];
}

/**
 * Update subscription
 * @param subscriptionId - Subscription ID
 * @param data - Partial subscription data to update
 * @returns Updated subscription or null if not found
 */
export async function updateSubscription(
  subscriptionId: string,
  data: Partial<NewSubscription>
): Promise<Subscription | null> {
  const result = await db
    .update(subscriptions)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(subscriptions.id, subscriptionId))
    .returning();

  return result[0] || null;
}

/**
 * Update subscription status
 * @param subscriptionId - Subscription ID
 * @param status - New status
 * @param reason - Optional reason for status change
 * @returns Updated subscription or null if not found
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string,
  reason?: string
): Promise<Subscription | null> {
  const updateData: Partial<NewSubscription> & { cancelledAt?: Date; cancelReason?: string } = {
    status,
    updatedAt: new Date()
  };

  if (status === SubscriptionStatus.CANCELLED) {
    updateData.cancelledAt = new Date();
    if (reason) {
      updateData.cancelReason = reason;
    }
  }

  const result = await db
    .update(subscriptions)
    .set(updateData)
    .where(eq(subscriptions.id, subscriptionId))
    .returning();

  return result[0] || null;
}

/**
 * Cancel subscription
 * @param subscriptionId - Subscription ID
 * @param reason - Optional cancellation reason
 * @param cancelAtPeriodEnd - Whether to cancel at period end or immediately
 * @returns Updated subscription or null if not found
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string,
  cancelAtPeriodEnd: boolean = false
): Promise<Subscription | null> {
  const result = await db
    .update(subscriptions)
    .set({
      status: cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: reason,
      cancelAtPeriodEnd,
      updatedAt: new Date()
    })
    .where(eq(subscriptions.id, subscriptionId))
    .returning();

  return result[0] || null;
}

/**
 * Get subscription with user details
 * @param subscriptionId - Subscription ID
 * @returns Subscription with user details or null if not found
 */
export async function getSubscriptionWithUser(subscriptionId: string): Promise<SubscriptionWithUser | null> {
  const result = await db
    .select()
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);

  if (!result[0]) return null;

  return {
    ...result[0].subscriptions,
    user: result[0].users!
  };
}

/**
 * Get subscriptions expiring soon
 * @param days - Number of days to look ahead (default: 7)
 * @returns Array of subscriptions expiring within the specified days
 */
export async function getSubscriptionsExpiringSoon(days: number = 7): Promise<Subscription[]> {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);

  return await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.status, SubscriptionStatus.ACTIVE), lte(subscriptions.endDate, expirationDate)))
    .orderBy(asc(subscriptions.endDate));
}

/**
 * Check if user has active subscription
 * @param userId - User ID
 * @returns True if user has active subscription, false otherwise
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, SubscriptionStatus.ACTIVE)));

  return result[0].count > 0;
}

/**
 * Get user's current plan
 * @param userId - User ID
 * @returns Plan ID (defaults to FREE if no active subscription)
 */
export async function getUserPlan(userId: string): Promise<string> {
  const subscription = await getUserActiveSubscription(userId);
  return subscription?.planId || PaymentPlan.FREE;
}

// ===================== Subscription History Queries =====================

/**
 * Create subscription history entry
 * @param data - Subscription history data
 * @returns Created history entry
 */
export async function createSubscriptionHistory(data: NewSubscriptionHistory): Promise<SubscriptionHistoryType> {
  const result = await db
    .insert(subscriptionHistory)
    .values({
      ...data,
      createdAt: new Date()
    })
    .returning();

  return result[0];
}

/**
 * Get subscription history
 * @param subscriptionId - Subscription ID
 * @returns Array of subscription history entries ordered by creation date
 */
export async function getSubscriptionHistory(subscriptionId: string): Promise<SubscriptionHistoryType[]> {
  return await db
    .select()
    .from(subscriptionHistory)
    .where(eq(subscriptionHistory.subscriptionId, subscriptionId))
    .orderBy(desc(subscriptionHistory.createdAt));
}

/**
 * Log subscription change
 * @param subscriptionId - Subscription ID
 * @param action - Action taken
 * @param previousStatus - Previous status
 * @param newStatus - New status
 * @param previousPlan - Previous plan
 * @param newPlan - New plan
 * @param reason - Reason for change
 * @param metadata - Additional metadata
 * @returns Created history entry
 */
export async function logSubscriptionChange(
  subscriptionId: string,
  action: string,
  previousStatus?: string,
  newStatus?: string,
  previousPlan?: string,
  newPlan?: string,
  reason?: string,
  metadata?: Record<string, unknown>
): Promise<SubscriptionHistoryType> {
  return await createSubscriptionHistory({
    subscriptionId,
    action,
    previousStatus,
    newStatus,
    previousPlan,
    newPlan,
    reason,
    metadata: metadata ? JSON.stringify(metadata) : null
  });
}

/**
 * Get subscription statistics
 * @returns Subscription statistics including total, active, cancelled, and plan distribution
 */
export async function getSubscriptionStats() {
  const totalSubscriptions = await db.select({ count: count() }).from(subscriptions);

  const activeSubscriptions = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, SubscriptionStatus.ACTIVE));

  const cancelledSubscriptions = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, SubscriptionStatus.CANCELLED));

  const planDistribution = await db
    .select({
      planId: subscriptions.planId,
      count: count()
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, SubscriptionStatus.ACTIVE))
    .groupBy(subscriptions.planId);

  return {
    total: totalSubscriptions[0].count,
    active: activeSubscriptions[0].count,
    cancelled: cancelledSubscriptions[0].count,
    planDistribution
  };
}
