import { and, eq, sql } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  ActivityType,
  type NewActivityLog,
  NewUser,
  passwordResetTokens,
  users,
  verificationTokens,
  newsletterSubscriptions,
  type NewNewsletterSubscription,
  type NewsletterSubscription,
  comments,
  votes,
  InsertVote,
  subscriptions,
  subscriptionHistory,
  SubscriptionStatus,
  type Subscription,
  type NewSubscription,
  type SubscriptionHistory as SubscriptionHistoryType,
  type NewSubscriptionHistory,
  type SubscriptionWithUser,
  clients,
  type Client,
  type NewClient,
  type ClientWithUser
} from "./schema";
import { desc, isNull, count, asc, lte, like, or } from "drizzle-orm";
import type { NewComment, CommentWithUser } from "@/lib/types/comment";
import { PaymentPlan } from "../constants";
import type { ClientListOptions } from "@/lib/types/client";

export async function logActivity(
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || "",
  };

  await db.insert(activityLogs).values(newActivity);
}

// ######################### User Queries #########################

export async function getUserByEmail(email: string) {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. User validation is disabled.");
    return null;
  }
  
  try {
    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (usersList.length === 0) {
      throw new Error("User not found");
    }

    return usersList[0];
  } catch (error) {
        if (error instanceof Error && error.message === "User not found") {
            console.warn(`User validation failed: No user found with email ${email}`);
          } else {
            console.error("Database error in getUserByEmail:", error);
          }    
          // Return null instead of throwing an error to allow the auth flow to continue
    return null;
  }
}

export async function updateUserPassword(
  newPasswordHash: string,
  userId: string
) {
  return db
    .update(users)
    .set({ passwordHash: newPasswordHash })
    .where(eq(users.id, userId));
}

export async function insertNewUser(user: NewUser) {
  return db.insert(users).values(user).returning();
}

export async function softDeleteUser(userId: string) {
  return db
    .update(users)
    .set({
      deletedAt: sql`CURRENT_TIMESTAMP`,
      email: sql`CONCAT(email, '-', id, '-deleted')`,
    })
    .where(eq(users.id, userId));
}

export async function updateUser(
  values: Pick<NewUser, "email" | "name">,
  userId: string
) {
  return db.update(users).set(values).where(eq(users.id, userId));
}

export async function updateUserVerification(email: string, verified: boolean) {
  return db
    .update(users)
    .set({ emailVerified: verified ? new Date() : null })
    .where(eq(users.email, email));
}

// ######################### Password Token Queries #########################

export async function getPasswordResetTokenByEmail(email: string) {
  const tokens = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.email, email))
    .limit(1);

  return tokens[0];
}

export async function getPasswordResetTokenByToken(token: string) {
  const tokens = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  return tokens.at(0);
}

export async function deletePasswordResetToken(token: string) {
  return db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));
}

// ######################### Verification Token Queries #########################

export async function getVerificationTokenByEmail(email: string) {
  const tokens = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.email, email))
    .limit(1);

  return tokens[0];
}

export async function getVerificationTokenByToken(token: string) {
  const tokens = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  return tokens.at(0);
}

export async function deleteVerificationToken(token: string) {
  return db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));
}

export async function getUserById(id: string) {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. User validation is disabled.");
    return null;
  }
  try {
      const usersList = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
  
      if (usersList.length === 0) {
        throw new Error("User not found");
      }
      return usersList[0];
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      console.warn(`User validation failed: No user found with id ${id}`);
    } else {
      console.error("Database error in getUserById:", error);
    }
    return null;
  }
}

// ######################### Newsletter Subscription Queries #########################

export async function createNewsletterSubscription(
  email: string,
  source: string = "footer"
): Promise<NewsletterSubscription | null> {
  try {
    const newSubscription: NewNewsletterSubscription = {
      email: email.toLowerCase().trim(),
      source,
    };

    const result = await db
      .insert(newsletterSubscriptions)
      .values(newSubscription)
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error creating newsletter subscription:", error);
    return null;
  }
}

export async function getNewsletterSubscriptionByEmail(email: string) {
  try {
    const subscriptions = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .limit(1);

    return subscriptions[0] || null;
  } catch (error) {
    console.error("Error getting newsletter subscription:", error);
    return null;
  }
}

export async function updateNewsletterSubscription(
  email: string,
  updates: Partial<Pick<NewsletterSubscription, "isActive" | "unsubscribedAt">>
) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set(updates)
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error updating newsletter subscription:", error);
    return null;
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set({
        isActive: false,
        unsubscribedAt: new Date(),
      })
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return null;
  }
}

export async function resubscribeToNewsletter(email: string) {
  try {
    const result = await db
      .update(newsletterSubscriptions)
      .set({
        isActive: true,
        unsubscribedAt: null,
      })
      .where(eq(newsletterSubscriptions.email, email.toLowerCase().trim()))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error resubscribing to newsletter:", error);
    return null;
  }
}

export async function getNewsletterStats() {
  try {
    const totalSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.isActive, true));

    const recentSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscriptions)
      .where(
        sql`${newsletterSubscriptions.subscribedAt} >= NOW() - INTERVAL '30 days'`
      );

    return {
      totalActive: totalSubscriptions[0]?.count || 0,
      recentSubscriptions: recentSubscriptions[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error getting newsletter stats:", error);
    return {
      totalActive: 0,
      recentSubscriptions: 0,
    };
  }
}

// ######################### Vote Queries #########################

export async function createVote(vote: InsertVote) {
  return db.insert(votes).values(vote).returning();
}

export async function getVoteByUserIdAndItemId(userId: string, itemId: string) {
  return db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.itemId, itemId))).limit(1);
}

export async function deleteVote(voteId: string) {
  return db.delete(votes).where(eq(votes.id, voteId));
}

export async function getItemsSortedByVotes(limit: number = 10, offset: number = 0) {
  const itemsWithVotes = await db
    .select({
      itemId: votes.itemId,
      voteCount: sql<number>`count(${votes.id})`.as('vote_count'),
    })
    .from(votes)
    .groupBy(votes.itemId)
    .orderBy(sql`vote_count DESC`)
    .limit(limit)
    .offset(offset);

  return itemsWithVotes;
}

export async function getVoteCountForItem(itemId: string): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(votes)
    .where(eq(votes.itemId, itemId));

  return Number(result?.count || 0);
}

// export async function getActivityLogs() {}
// ######################### Comment Queries #########################

export async function createComment(data: NewComment) {
  return (await db.insert(comments).values(data).returning())[0];
}

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
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.itemId, itemId), isNull(comments.deletedAt)))
    .orderBy(desc(comments.createdAt));
}

export async function updateComment(id: string, content: string) {
  const [comment] = await db
    .update(comments)
    .set({ content, updatedAt: new Date() })
    .where(eq(comments.id, id))
    .returning();
  return comment;
}

export async function deleteComment(id: string) {
  const [comment] = await db
    .update(comments)
    .set({ deletedAt: new Date() })
    .where(eq(comments.id, id))
    .returning();
  return comment;
}

// ######################### Comment Queries #########################

export async function getCommentById(id: string) {
  return (await db.select().from(comments).where(eq(comments.id, id)).limit(1))[0];
}

export async function updateCommentRating(id: string, rating: number) {
  return (await db.update(comments).set({ rating }).where(eq(comments.id, id)).returning())[0];
}

// ######################### Subscription Queries #########################

/**
 * Get active subscription for a user
 */
export async function getUserActiveSubscription(userId: string): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, SubscriptionStatus.ACTIVE)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get all subscriptions for a user
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
 */
export async function getSubscriptionByProviderSubscriptionId(
  paymentProvider: string,
  subscriptionId: string
): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.paymentProvider, paymentProvider as any),
        eq(subscriptions.subscriptionId, subscriptionId)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new subscription
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
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string,
  reason?: string
): Promise<Subscription | null> {
  const updateData: any = {
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
 */
export async function getSubscriptionsExpiringSoon(days: number = 7): Promise<Subscription[]> {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);

  return await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, SubscriptionStatus.ACTIVE),
        lte(subscriptions.endDate, expirationDate)
      )
    )
    .orderBy(asc(subscriptions.endDate));
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, SubscriptionStatus.ACTIVE)
      )
    );

  return result[0].count > 0;
}

/**
 * Get user's current plan
 */
export async function getUserPlan(userId: string): Promise<string> {
  const subscription = await getUserActiveSubscription(userId);
  return subscription?.planId || PaymentPlan.FREE;
}

// ######################### Subscription History Queries #########################

/**
 * Create subscription history entry
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
 */
export async function logSubscriptionChange(
  subscriptionId: string,
  action: string,
  previousStatus?: string,
  newStatus?: string,
  previousPlan?: string,
  newPlan?: string,
  reason?: string,
  metadata?: any
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
 */
export async function getSubscriptionStats() {
  const totalSubscriptions = await db
    .select({ count: count() })
    .from(subscriptions);

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

// ######################### Client Queries #########################

/**
 * Create a new client
 */
export async function createClient(data: NewClient): Promise<Client> {
  const result = await db
    .insert(clients)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  return result[0];
}

/**
 * Get client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Get clients with pagination and filtering
 */
export async function getClients(options: ClientListOptions): Promise<ClientWithUser[]> {
  const { 
    limit = 10, 
    offset = 0, 
    search = '', 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    status,
    plan,
    accountType,
    userId 
  } = options;

  const whereConditions = [];

  // Add search condition
  if (search) {
    whereConditions.push(
      or(
        like(clients.displayName, `%${search}%`),
        like(clients.username, `%${search}%`),
        like(clients.company, `%${search}%`),
        like(clients.location, `%${search}%`),
        like(clients.phone, `%${search}%`),
        like(clients.website, `%${search}%`)
      )
    );
  }

  // Add filter conditions
  if (status) {
    whereConditions.push(eq(clients.status, status));
  }

  if (plan) {
    whereConditions.push(eq(clients.plan, plan));
  }

  if (accountType) {
    whereConditions.push(eq(clients.accountType, accountType));
  }

  if (userId) {
    whereConditions.push(eq(clients.userId, userId));
  }

  const query = db
    .select({
      clients: clients,
      user: users
    })
    .from(clients)
    .leftJoin(users, eq(clients.userId, users.id));

  if (whereConditions.length > 0) {
    query.where(and(...whereConditions));
  }

  // Add sorting
  const orderByClause = sortBy === 'displayName' ? (sortOrder === 'asc' ? asc(clients.displayName) : desc(clients.displayName)) :
    sortBy === 'username' ? (sortOrder === 'asc' ? asc(clients.username) : desc(clients.username)) :
    sortBy === 'accountType' ? (sortOrder === 'asc' ? asc(clients.accountType) : desc(clients.accountType)) :
    sortBy === 'status' ? (sortOrder === 'asc' ? asc(clients.status) : desc(clients.status)) :
    sortBy === 'plan' ? (sortOrder === 'asc' ? asc(clients.plan) : desc(clients.plan)) :
    sortOrder === 'asc' ? asc(clients.createdAt) : desc(clients.createdAt);

  return query
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);
}

/**
 * Update client
 */
export async function updateClient(
  clientId: string,
  data: Partial<NewClient>
): Promise<Client | null> {
  const result = await db
    .update(clients)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(clients.id, clientId))
    .returning();

  return result[0] || null;
}

/**
 * Delete client (hard delete for now since no deletedAt field)
 */
export async function deleteClient(clientId: string): Promise<Client | null> {
  const result = await db
    .delete(clients)
    .where(eq(clients.id, clientId))
    .returning();

  return result[0] || null;
}

/**
 * Get client with user details
 */
export async function getClientWithUser(clientId: string): Promise<ClientWithUser | null> {
  const result = await db
    .select({
      clients: clients,
      user: users
    })
    .from(clients)
    .leftJoin(users, eq(clients.userId, users.id))
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!result[0]) return null;

  return {
    ...result[0].clients,
    user: result[0].user!
  };
}

/**
 * Get client statistics
 */
export async function getClientStats() {
  const totalClients = await db
    .select({ count: count() })
    .from(clients);

  const activeClients = await db
    .select({ count: count() })
    .from(clients)
    .where(eq(clients.status, 'active'));

  const trialClients = await db
    .select({ count: count() })
    .from(clients)
    .where(eq(clients.status, 'trial'));

  return {
    total: totalClients[0].count,
    active: activeClients[0].count,
    trial: trialClients[0].count
  };
}
