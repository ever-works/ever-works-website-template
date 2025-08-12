import { and, eq, sql, type SQL } from "drizzle-orm";
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
  accounts
} from "./schema";
import { desc, isNull, count, asc, lte } from "drizzle-orm";
import type { NewComment, CommentWithUser } from "@/lib/types/comment";
import type { ClientProfile, NewClientProfile, ClientProfileWithUser } from "./schema";
import { clientProfiles } from "./schema";

import { PaymentPlan } from "../constants";
import { comparePasswords } from "../auth/credentials";

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

// ######################### Client Profile Queries #########################

/**
 * Create a new client profile
 */
export async function createClientProfile(data: NewClientProfile): Promise<ClientProfile> {
  const [profile] = await db
    .insert(clientProfiles)
    .values(data)
    .returning();

  return profile;
}

/**
 * Find client profile by ID
 */
export async function getClientProfileById(id: string): Promise<ClientProfile | null> {
  const [profile] = await db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.id, id));

  return profile || null;
}

/**
 * Find client profile with user data
 */
export async function getClientProfileWithUser(id: string): Promise<ClientProfileWithUser | null> {
  const [profile] = await db
    .select({
      id: clientProfiles.id,
      userId: clientProfiles.userId,
      displayName: clientProfiles.displayName,
      username: clientProfiles.username,
      bio: clientProfiles.bio,
      jobTitle: clientProfiles.jobTitle,
      company: clientProfiles.company,
      industry: clientProfiles.industry,
      phone: clientProfiles.phone,
      website: clientProfiles.website,
      location: clientProfiles.location,
      accountType: clientProfiles.accountType,
      status: clientProfiles.status,
      plan: clientProfiles.plan,
      timezone: clientProfiles.timezone,
      language: clientProfiles.language,
      twoFactorEnabled: clientProfiles.twoFactorEnabled,
      emailVerified: clientProfiles.emailVerified,
      totalSubmissions: clientProfiles.totalSubmissions,
      notes: clientProfiles.notes,
      tags: clientProfiles.tags,
      createdAt: clientProfiles.createdAt,
      updatedAt: clientProfiles.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        createdAt: users.createdAt,
      },
    })
    .from(clientProfiles)
    .leftJoin(users, eq(clientProfiles.userId, users.id))
    .where(eq(clientProfiles.id, id));

  return profile || null;
}

/**
 * Get all client profiles with pagination
 */
export async function getClientProfiles(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  accountType?: string;
}): Promise<{
  profiles: ClientProfileWithUser[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}> {
  const { page = 1, limit = 10, search, status, plan, accountType } = params;
  const offset = (page - 1) * limit;

  const whereConditions: SQL[] = [];

  if (search) {
    const escapedSearch = search
      .replace(/\\/g, '\\\\')
      .replace(/[%_]/g, '\\$&');
    
    whereConditions.push(
      sql`(${clientProfiles.username} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.displayName} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.company} ILIKE ${`%${escapedSearch}%`} OR
           ${users.name} ILIKE ${`%${escapedSearch}%`} OR
           ${users.email} ILIKE ${`%${escapedSearch}%`})`
    );
  }

  if (status) {
    whereConditions.push(eq(clientProfiles.status, status as any));
  }

  if (plan) {
    whereConditions.push(eq(clientProfiles.plan, plan as any));
  }

  if (accountType) {
    whereConditions.push(eq(clientProfiles.accountType, accountType as any));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql`count(*)` })
    .from(clientProfiles)
    .leftJoin(users, eq(clientProfiles.userId, users.id))
    .where(whereClause);

  const total = Number(countResult[0]?.count || 0);

  // Get profiles with user data
  const profiles = await db
    .select({
      id: clientProfiles.id,
      userId: clientProfiles.userId,
      displayName: clientProfiles.displayName,
      username: clientProfiles.username,
      bio: clientProfiles.bio,
      jobTitle: clientProfiles.jobTitle,
      company: clientProfiles.company,
      industry: clientProfiles.industry,
      phone: clientProfiles.phone,
      website: clientProfiles.website,
      location: clientProfiles.location,
      accountType: clientProfiles.accountType,
      status: clientProfiles.status,
      plan: clientProfiles.plan,
      timezone: clientProfiles.timezone,
      language: clientProfiles.language,
      twoFactorEnabled: clientProfiles.twoFactorEnabled,
      emailVerified: clientProfiles.emailVerified,
      totalSubmissions: clientProfiles.totalSubmissions,
      notes: clientProfiles.notes,
      tags: clientProfiles.tags,
      createdAt: clientProfiles.createdAt,
      updatedAt: clientProfiles.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        createdAt: users.createdAt,
      },
    })
    .from(clientProfiles)
    .leftJoin(users, eq(clientProfiles.userId, users.id))
    .where(whereClause)
    .orderBy(desc(clientProfiles.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    profiles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
}

/**
 * Update client profile
 */
export async function updateClientProfile(id: string, data: Partial<NewClientProfile>): Promise<ClientProfile | null> {
  const [profile] = await db
    .update(clientProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clientProfiles.id, id))
    .returning();

  return profile || null;
}

/**
 * Delete client profile
 */
export async function deleteClientProfile(id: string): Promise<boolean> {
  const [profile] = await db
    .delete(clientProfiles)
    .where(eq(clientProfiles.id, id))
    .returning();

  return !!profile;
}

/**
 * Get client profile by user ID
 */
export async function getClientProfileByUserId(userId: string): Promise<ClientProfileWithUser | null> {
  try {
    const [profile] = await db
      .select({
        id: clientProfiles.id,
        userId: clientProfiles.userId,
        displayName: clientProfiles.displayName,
        username: clientProfiles.username,
        bio: clientProfiles.bio,
        jobTitle: clientProfiles.jobTitle,
        company: clientProfiles.company,
        industry: clientProfiles.industry,
        phone: clientProfiles.phone,
        website: clientProfiles.website,
        location: clientProfiles.location,
        accountType: clientProfiles.accountType,
        status: clientProfiles.status,
        plan: clientProfiles.plan,
        timezone: clientProfiles.timezone,
        language: clientProfiles.language,
        twoFactorEnabled: clientProfiles.twoFactorEnabled,
        emailVerified: clientProfiles.emailVerified,
        totalSubmissions: clientProfiles.totalSubmissions,
        notes: clientProfiles.notes,
        tags: clientProfiles.tags,
        createdAt: clientProfiles.createdAt,
        updatedAt: clientProfiles.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          avatar: users.avatar,
          title: users.title,
          createdAt: users.createdAt,
        },
      })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .where(eq(clientProfiles.userId, userId))
      .limit(1);

    return profile || null;
  } catch (error) {
    console.error("Error getting client profile by user ID:", error);
    return null;
  }
}

/**
 * Get client profile statistics
 */
export async function getClientProfileStats() {
  const totalResult = await db
    .select({ count: sql`count(*)` })
    .from(clientProfiles);

  const activeResult = await db
    .select({ count: sql`count(*)` })
    .from(clientProfiles)
    .where(eq(clientProfiles.status, 'active'));

  const inactiveResult = await db
    .select({ count: sql`count(*)` })
    .from(clientProfiles)
    .where(eq(clientProfiles.status, 'inactive'));

  const planStats = await db
    .select({ plan: clientProfiles.plan, count: sql`count(*)` })
    .from(clientProfiles)
    .groupBy(clientProfiles.plan);

  const accountTypeStats = await db
    .select({ accountType: clientProfiles.accountType, count: sql`count(*)` })
    .from(clientProfiles)
    .groupBy(clientProfiles.accountType);

  const byPlan: Record<string, number> = {};
  planStats.forEach((stat: { plan: string | null; count: number }) => {
    byPlan[stat.plan || 'unknown'] = Number(stat.count);
  });

  const byAccountType: Record<string, number> = {};
  accountTypeStats.forEach((stat: { accountType: string | null; count: number }) => {
    byAccountType[stat.accountType || 'unknown'] = Number(stat.count);
  });

  return {
    total: Number(totalResult[0]?.count || 0),
    active: Number(activeResult[0]?.count || 0),
    inactive: Number(inactiveResult[0]?.count || 0),
    byPlan,
    byAccountType,
  };
}

/**
 * Create account record for client with password
 */
export async function createClientAccount(userId: string, email: string, passwordHash: string): Promise<any> {
  try {
    // Check if account already exists
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    if (existingAccount.length > 0) {
      console.log(`Account already exists for user: ${userId}`);
      return existingAccount[0];
    }

    // Create account record for client
    const newAccount = {
      userId,
      type: "credentials" as any,
      provider: "credentials",
      providerAccountId: userId, // Use userId as providerAccountId for credentials
      email,
      passwordHash,
      refresh_token: null,
      access_token: null,
      expires_at: null,
      token_type: null,
      scope: null,
      id_token: null,
      session_state: null,
    };

    const [account] = await db
      .insert(accounts)
      .values(newAccount)
      .returning();

    return account || null;
  } catch (error) {
    console.error("Error creating client account:", error);
    return null;
  }
}

/**
 * Get client account by email
 */
export async function getClientAccountByEmail(email: string): Promise<any> {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email))
      .limit(1);

    return account || null;
  } catch (error) {
    console.error("Error getting client account by email:", error);
    return null;
  }
}

/**
 * Verify client password
 */
export async function verifyClientPassword(email: string, password: string): Promise<boolean> {
  try {
    const account = await getClientAccountByEmail(email);
    if (!account || !account.passwordHash) {
      return false;
    }

    const isValid = await comparePasswords(password, account.passwordHash);
    return isValid;
  } catch (error) {
    console.error("Error verifying client password:", error);
    return false;
  }
}

