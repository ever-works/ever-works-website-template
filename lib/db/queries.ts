import { and, eq, sql, type SQL } from 'drizzle-orm';
import { db } from './drizzle';
import {
	activityLogs,
	ActivityType,
	type NewActivityLog,
	type ActivityLog,
	NewUser,
	passwordResetTokens,
	users,
	verificationTokens,
	newsletterSubscriptions,
	type NewNewsletterSubscription,
	type NewsletterSubscription,
	comments,
	type NewComment,
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
	accounts,
	paymentProviders,
	paymentAccounts,
	clientProfiles,
	roles,
	userRoles
} from "./schema";
import { desc, isNull, count, countDistinct, asc, lte, gte, or } from "drizzle-orm";
// import type { NewComment, CommentWithUser } from "@/lib/types/comment";
import type { ClientProfile, NewClientProfile, OldPaymentProvider, PaymentAccount, NewPaymentAccount, NewPaymentProvider } from "./schema";

// Enhanced client profile type with authentication data
export type ClientProfileWithAuth = ClientProfile & {
  accountProvider: string;
  isActive: boolean;
};

// Type for the enum values
type ClientStatus = "active" | "inactive" | "suspended" | "trial";
type ClientPlan = "free" | "standard" | "premium";
type ClientAccountType = "individual" | "business" | "enterprise";

// import { randomUUID } from "crypto"; // Removed for Edge Runtime compatibility

import { PaymentPlan } from "../constants";
import { comparePasswords } from "../auth/credentials";

/**
 * Safely extract username from email address
 * Handles edge cases like empty strings, malformed emails, etc.
 */
function extractUsernameFromEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const parts = email.split('@');
  if (parts.length !== 2) {
    return null;
  }
  
  const username = parts[0].trim();
  if (!username || username.length === 0) {
    return null;
  }
  
  // Remove any invalid characters, limit length, and normalize to lowercase
  const cleanUsername = username
    .toLowerCase() // Normalize to lowercase for consistency
    .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric, dots, underscores, hyphens
    .substring(0, 30); // Limit length to 30 characters
  
  return cleanUsername.length > 0 ? cleanUsername : null;
}

/**
 * Ensure a username is unique by appending a numeric suffix if needed
 * @param baseUsername - The base username to check
 * @returns A unique username
 */
async function ensureUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;
  let counter = 1;
  
  // Check if username exists, append number if it does
  while (true) {
    const existingProfile = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.username, username))
      .limit(1);
    
    if (existingProfile.length === 0) {
      return username; // Username is unique
    }
    
    // Append counter and try again
    username = `${baseUsername}${counter}`;
    counter++;
    
    // Prevent infinite loops (max 999 attempts)
    if (counter > 999) {
      // Fallback to timestamp-based username
      const timestamp = Date.now().toString().slice(-6);
      return `${baseUsername}${timestamp}`;
    }
  }
}

export async function logActivity(
  type: ActivityType, 
  userId?: string, 
  ipAddress?: string
) {
	const newActivity: NewActivityLog = {
		userId: userId || null,
		action: type,
		ipAddress: ipAddress || ''
	};

	await db.insert(activityLogs).values(newActivity);
}

// ######################### User Queries #########################

export async function getUserByEmail(email: string) {
	// Check if DATABASE_URL is set
	if (!process.env.DATABASE_URL) {
		console.warn('DATABASE_URL is not set. User validation is disabled.');
		return null;
	}

	try {
		const usersList = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (usersList.length === 0) {
			throw new Error('User not found');
		}

		return usersList[0];
	} catch (error) {
		if (error instanceof Error && error.message === 'User not found') {
			console.warn(`User validation failed: No user found with email ${email}`);
		} else {
			console.error('Database error in getUserByEmail:', error);
		}
		// Return null instead of throwing an error to allow the auth flow to continue
		return null;
	}
}

export async function updateUserPassword(newPasswordHash: string, userId: string) {
	return db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId));
}

export async function insertNewUser(user: NewUser) {
	return db.insert(users).values(user).returning();
}

export async function softDeleteUser(userId: string) {
	return db
		.update(users)
		.set({
			deletedAt: sql`CURRENT_TIMESTAMP`,
			email: sql`CONCAT(email, '-', id, '-deleted')`
		})
		.where(eq(users.id, userId));
}

export async function updateUser(values: Pick<NewUser, 'email'>, userId: string) {
	return db.update(users).set(values).where(eq(users.id, userId));
}

export async function updateUserVerification(email: string, verified: boolean) {
	return db
		.update(users)
		.set({ emailVerified: verified ? new Date() : null })
		.where(eq(users.email, email));
}

export async function updateClientProfileName(userId: string, name: string) {
	return db
		.update(clientProfiles)
		.set({ name, updatedAt: new Date() })
		.where(eq(clientProfiles.userId, userId));
}

// ######################### Password Token Queries #########################

export async function getPasswordResetTokenByEmail(email: string) {
	const tokens = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.email, email)).limit(1);

	return tokens[0];
}

export async function getPasswordResetTokenByToken(token: string) {
	const tokens = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);

	return tokens.at(0);
}

export async function deletePasswordResetToken(token: string) {
	return db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
}

// ######################### Verification Token Queries #########################

export async function getVerificationTokenByEmail(email: string) {
	const tokens = await db.select().from(verificationTokens).where(eq(verificationTokens.email, email)).limit(1);

	return tokens[0];
}

export async function getVerificationTokenByToken(token: string) {
	const tokens = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token)).limit(1);

	return tokens.at(0);
}

export async function deleteVerificationToken(token: string) {
	return db.delete(verificationTokens).where(eq(verificationTokens.token, token));
}

export async function getUserById(id: string) {
	if (!process.env.DATABASE_URL) {
		console.warn('DATABASE_URL is not set. User validation is disabled.');
		return null;
	}
	try {
		const usersList = await db.select().from(users).where(eq(users.id, id)).limit(1);

		if (usersList.length === 0) {
			throw new Error('User not found');
		}
		return usersList[0];
	} catch (error) {
		if (error instanceof Error && error.message === 'User not found') {
			console.warn(`User validation failed: No user found with id ${id}`);
		} else {
			console.error('Database error in getUserById:', error);
		}
		return null;
	}
}

// ######################### Newsletter Subscription Queries #########################

export async function createNewsletterSubscription(
	email: string,
	source: string = 'footer'
): Promise<NewsletterSubscription | null> {
	try {
		const newSubscription: NewNewsletterSubscription = {
			email: email.toLowerCase().trim(),
			source
		};

		const result = await db.insert(newsletterSubscriptions).values(newSubscription).returning();

		return result[0] || null;
	} catch (error) {
		console.error('Error creating newsletter subscription:', error);
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
		console.error('Error getting newsletter subscription:', error);
		return null;
	}
}

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

// ######################### Vote Queries #########################

export async function createVote(vote: InsertVote) {
	return db.insert(votes).values(vote).returning();
}

export async function getVoteByUserIdAndItemId(userId: string, itemId: string) {
	return db
		.select()
		.from(votes)
		.where(and(eq(votes.userId, userId), eq(votes.itemId, itemId)))
		.limit(1);
}

export async function deleteVote(voteId: string) {
	return db.delete(votes).where(eq(votes.id, voteId));
}

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

export async function getVoteCountForItem(itemId: string): Promise<number> {
	const [result] = await db
		.select({
			count: sql<number>`count(*)`.as('count')
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

export async function getCommentsByItemId(itemId: string): Promise<any[]> {
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

export async function updateComment(id: string, content: string) {
	const [comment] = await db
		.update(comments)
		.set({ content, updatedAt: new Date() })
		.where(eq(comments.id, id))
		.returning();
	return comment;
}

export async function deleteComment(id: string) {
	const [comment] = await db.update(comments).set({ deletedAt: new Date() }).where(eq(comments.id, id)).returning();
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
		.where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, SubscriptionStatus.ACTIVE)))
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
		.where(and(eq(subscriptions.status, SubscriptionStatus.ACTIVE), lte(subscriptions.endDate, expirationDate)))
		.orderBy(asc(subscriptions.endDate));
}

/**
 * Check if user has active subscription
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

// ######################### Client Profile Queries #########################

/**
 * Create a new client user (creates user record but marks as client)
 */
export async function createClientUser(name: string, email: string): Promise<any> {
  try {
    // Normalize and validate email, ensure uniqueness
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      console.error(`User already exists with email: ${normalizedEmail}`);
      return null;
    }

    // Create user record for client (without password hash)
    const newUser: NewUser = {
      email: normalizedEmail,
      // No passwordHash - clients store passwords in accounts table
    };

    const [createdUser] = await insertNewUser(newUser);
    return createdUser || null;
  } catch (error) {
    console.error("Error creating client user:", error);
    return null;
  }
}

/**
 * Create a new client profile
 */
export async function createClientProfile(data: {
  userId: string;
  email: string;
  name: string;
  displayName?: string;
  username?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  status?: string;
  plan?: string;
  accountType?: string;
}): Promise<ClientProfile> {
  // Normalize email for consistency
  const normalizedEmail = data.email.toLowerCase().trim();
  
  // Generate a unique username if not provided
  let finalUsername = data.username;
  if (!finalUsername) {
    const extractedUsername = extractUsernameFromEmail(normalizedEmail);
    if (extractedUsername) {
      finalUsername = await ensureUniqueUsername(extractedUsername);
    } else {
      // Fallback: generate unique username from timestamp
      const timestamp = Date.now().toString().slice(-6);
      finalUsername = await ensureUniqueUsername(`user${timestamp}`);
    }
  } else {
    // Ensure provided username is also unique and normalized
    finalUsername = await ensureUniqueUsername(finalUsername.toLowerCase());
  }

  const insertData: NewClientProfile = {
    userId: data.userId,
    email: normalizedEmail,
    name: data.name,
    displayName: data.displayName || data.name,
    username: finalUsername,
    bio: data.bio || "Welcome! I'm a new user on this platform.",
    jobTitle: data.jobTitle || "User",
    company: data.company || "Unknown",
    status: (data.status as "active" | "inactive" | "suspended" | "trial") || "active",
    plan: (data.plan as "free" | "standard" | "premium") || "free",
    accountType: (data.accountType as "individual" | "business" | "enterprise") || "individual",
  };

  const [profile] = await db
    .insert(clientProfiles)
    .values(insertData)
    .returning();

	return profile;
}

/**
 * Find client profile by ID
 */
export async function getClientProfileById(id: string): Promise<ClientProfile | null> {
	const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.id, id));

	return profile || null;
}

/**
 * Find client profile by user ID
 */
export async function getClientProfileByUserId(userId: string): Promise<ClientProfile | null> {
	const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, userId));

	return profile || null;
}

/**
 * Get all client profiles with pagination and authentication data
 */
export async function getClientProfiles(params: {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	plan?: string;
	accountType?: string;
	provider?: string; // New: filter by auth provider
}): Promise<{
	profiles: ClientProfileWithAuth[];
	total: number;
	page: number;
	totalPages: number;
	limit: number;
}> {
	const { page = 1, limit = 10, search, status, plan, accountType, provider } = params;
	const offset = (page - 1) * limit;

	const whereConditions: SQL[] = [];

	if (search) {
		const escapedSearch = search.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');

		whereConditions.push(
			sql`(${clientProfiles.username} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.displayName} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.company} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.name} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.email} ILIKE ${`%${escapedSearch}%`})`
		);
	}

	if (status) {
		whereConditions.push(eq(clientProfiles.status, status as ClientStatus));
	}

	if (plan) {
		whereConditions.push(eq(clientProfiles.plan, plan as ClientPlan));
	}

	if (accountType) {
		whereConditions.push(eq(clientProfiles.accountType, accountType as ClientAccountType));
	}

	if (provider) {
		whereConditions.push(eq(accounts.provider, provider));
	}

	const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

	// Get total count with join and exclude admins (roles.is_admin = false OR NULL)
	const countResult = await db
		.select({ count: sql<number>`count(distinct ${clientProfiles.id})` })
		.from(clientProfiles)
		.leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(whereClause ? and(whereClause, isNull(roles.id)) : isNull(roles.id));

	const total = Number((countResult[0] as unknown as { count: number })?.count || 0);

	// Get profiles with authentication data and exclude admins (roles.is_admin = false)
	const profiles = await db
		.select({
			// Client profile fields
			id: clientProfiles.id,
			userId: clientProfiles.userId,
			email: clientProfiles.email,
			name: clientProfiles.name,
			displayName: clientProfiles.displayName,
			username: clientProfiles.username,
			bio: clientProfiles.bio,
			jobTitle: clientProfiles.jobTitle,
			company: clientProfiles.company,
			industry: clientProfiles.industry,
			phone: clientProfiles.phone,
			website: clientProfiles.website,
			location: clientProfiles.location,
			avatar: clientProfiles.avatar,
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
			// Account fields
			accountProvider: sql<string>`coalesce(${accounts.provider}, 'unknown')`,
		})
		.from(clientProfiles)
		.leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(whereClause ? and(whereClause, isNull(roles.id)) : isNull(roles.id))
		.orderBy(desc(clientProfiles.createdAt))
		.limit(limit)
		.offset(offset);

	// Transform to enhanced type
	const enhancedProfiles: ClientProfileWithAuth[] = profiles.map((profile: typeof profiles[0]) => ({
		...profile,
		accountType: profile.accountType || 'individual',
		isActive: profile.status === 'active',
	}));

	return {
		profiles: enhancedProfiles,
		total,
		page,
		totalPages: Math.ceil(total / limit),
		limit
	};
}

/**
 * Get comprehensive client statistics with multiple dimensions
 * Returns detailed analytics including provider distribution, plan analysis, and activity metrics
 */
export async function getEnhancedClientStats(): Promise<{
	overview: {
		total: number;
		active: number;
		inactive: number;
		suspended: number;
		trial: number;
	};
	byProvider: {
		credentials: number;
		google: number;
		github: number;
		facebook: number;
		twitter: number;
		linkedin: number;
		other: number;
	};
	byPlan: Record<string, number>;
	byAccountType: Record<string, number>;
	byStatus: Record<string, number>;
	activity: {
		newThisWeek: number;
		newThisMonth: number;
		activeThisWeek: number;
		activeThisMonth: number;
	};
	growth: {
		weeklyGrowth: number;
		monthlyGrowth: number;
	};
}> {
	// Get comprehensive stats with joins
	const statsResult = await db
		.select({
			status: clientProfiles.status,
			plan: clientProfiles.plan,
			accountType: clientProfiles.accountType,
			provider: accounts.provider,
			count: countDistinct(clientProfiles.id),
		})
		.from(clientProfiles)
		.leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(isNull(roles.id))
		.groupBy(clientProfiles.status, clientProfiles.plan, clientProfiles.accountType, accounts.provider);

	// Get total count
	const totalResult = await db
		.select({ count: countDistinct(clientProfiles.id) })
		.from(clientProfiles)
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(isNull(roles.id));

	const total = Number((totalResult[0] as unknown as { count: number })?.count || 0);

	// Initialize counters
	const byStatus: Record<string, number> = { active: 0, inactive: 0, suspended: 0, trial: 0 };
	const byPlan: Record<string, number> = { free: 0, standard: 0, premium: 0 };
	const byAccountType: Record<string, number> = { individual: 0, business: 0, enterprise: 0 };
	const byProvider = { 
		credentials: 0, 
		google: 0, 
		github: 0, 
		facebook: 0, 
		twitter: 0, 
		linkedin: 0, 
		other: 0 
	};

	// Process results
	for (const row of statsResult) {
		const count = Number(row.count);
		const status = row.status || 'active';  // Use a valid default
		const plan = row.plan || 'free';
		const accountType = row.accountType || 'individual';
		const provider = row.provider || 'unknown';

		// Count by status
		if (status in byStatus) {
			byStatus[status] += count;
		}

		// Count by plan
		if (plan in byPlan) {
			byPlan[plan] += count;
		}

		// Count by account type
		if (accountType in byAccountType) {
			byAccountType[accountType] += count;
		}

		// Count by provider
		const knownProviders = ['credentials', 'google', 'github', 'facebook', 'twitter', 'linkedin'] as const;
		if (knownProviders.includes(provider as any)) {
			byProvider[provider as keyof typeof byProvider] += count;
		} else {
			byProvider.other += count;
		}
	}

	// Get activity metrics
	const now = new Date();
	const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	// New clients this week
	const newThisWeekResult = await db
		.select({ count: countDistinct(clientProfiles.id) })
		.from(clientProfiles)
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(and(isNull(roles.id), gte(clientProfiles.createdAt, oneWeekAgo)));

	const newThisWeek = Number(newThisWeekResult[0]?.count || 0);

	// New clients this month
	const newThisMonthResult = await db
		.select({ count: countDistinct(clientProfiles.id) })
		.from(clientProfiles)
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(and(isNull(roles.id), gte(clientProfiles.createdAt, oneMonthAgo)));

	const newThisMonth = Number(newThisMonthResult[0]?.count || 0);

	// Active clients this week (have activity or recent login)
	const activeThisWeekResult = await db
		.select({ count: countDistinct(clientProfiles.id) })
		.from(clientProfiles)
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(
			and(
				isNull(roles.id),
				eq(clientProfiles.status, 'active'),
				or(
					gte(clientProfiles.updatedAt, oneWeekAgo),
					gte(clientProfiles.createdAt, oneWeekAgo)
				)
			)
		);

	const activeThisWeek = Number(activeThisWeekResult[0]?.count || 0);

	// Active clients this month
	const activeThisMonthResult = await db
		.select({ count: countDistinct(clientProfiles.id) })
		.from(clientProfiles)
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(
			and(
				isNull(roles.id),
				eq(clientProfiles.status, 'active'),
				or(
					gte(clientProfiles.updatedAt, oneMonthAgo),
					gte(clientProfiles.createdAt, oneMonthAgo)
				)
			)
		);

	const activeThisMonth = Number(activeThisMonthResult[0]?.count || 0);

	// Calculate growth rates (simplified - could be enhanced with historical data)
	const weeklyGrowth = total > 0 ? Math.round((newThisWeek / total) * 100) : 0;
	const monthlyGrowth = total > 0 ? Math.round((newThisMonth / total) * 100) : 0;

	return {
		overview: {
			total,
			active: byStatus.active,
			inactive: byStatus.inactive,
			suspended: byStatus.suspended,
			trial: byStatus.trial,
		},
		byProvider,
		byPlan,
		byAccountType,
		byStatus,
		activity: {
			newThisWeek,
			newThisMonth,
			activeThisWeek,
			activeThisMonth,
		},
		growth: {
			weeklyGrowth,
			monthlyGrowth,
		},
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
	const [profile] = await db.delete(clientProfiles).where(eq(clientProfiles.id, id)).returning();

	return !!profile;
}

/**
 * Find client profile by email
 */
export async function getClientProfileByEmail(email: string): Promise<ClientProfile | null> {
  // Resolve deterministic profile via accounts (accounts.email will be unique after migration)
  const account = await getClientAccountByEmail(email);
  if (!account) return null;
  
  const [profile] = await db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.id, account.userId))
    .limit(1);
    
  return profile || null;
}

/**
 * Get client profile statistics
 */
export async function getClientProfileStats() {
	const totalResult = await db.select({ count: sql`count(*)` }).from(clientProfiles);

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
	planStats.forEach((stat) => {
		byPlan[stat.plan || 'unknown'] = Number(stat.count);
	});

	const byAccountType: Record<string, number> = {};
	accountTypeStats.forEach((stat) => {
		byAccountType[stat.accountType || 'unknown'] = Number(stat.count);
	});

	return {
		total: Number(totalResult[0]?.count || 0),
		active: Number(activeResult[0]?.count || 0),
		inactive: Number(inactiveResult[0]?.count || 0),
		byPlan,
		byAccountType
	};
}

/**
 * Create account record for client with password
 */
export async function createClientAccount(userId: string | undefined, email: string, passwordHash?: string | null): Promise<any> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Resolve client profile ID when userId isn't provided
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const profile = await getClientProfileByEmail(normalizedEmail);
      if (!profile) {
        console.error(`No client profile found for email: ${normalizedEmail}`);
        return null;
      }
      resolvedUserId = profile.id;
    }

    // Check if credentials account already exists for this email
    const [existing] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, "credentials" as any),
          eq(accounts.email, normalizedEmail)
        )
      )
      .limit(1);

    if (existing) {
      return existing;
    }

    // Create account record for client
    const newAccount = {
      userId: resolvedUserId, // Must reference client_profiles.id
      type: "credentials" as any,
      provider: "credentials",
      providerAccountId: crypto.randomUUID(), // Opaque stable identifier per provider
      email: normalizedEmail,
      passwordHash: passwordHash || null,
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

// ######################### Payment Provider Queries #########################

export async function getPaymentProvider(id: string): Promise<OldPaymentProvider | null> {
  const result = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getPaymentProviderByName(name: string): Promise<OldPaymentProvider | null> {
  const result = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.name, name))
    .limit(1);

  return result[0] || null;
}

// ######################### Payment Account Queries #########################

export async function getPaymentAccountByUserId(userId: string): Promise<PaymentAccount | null> {
  const result = await db
    .select({
      id: paymentAccounts.id,
      userId: paymentAccounts.userId,
      providerId: paymentAccounts.providerId,
      customerId: paymentAccounts.customerId,
      accountId: paymentAccounts.accountId,
      createdAt: paymentAccounts.createdAt,
      updatedAt: paymentAccounts.updatedAt,
      lastUsed: paymentAccounts.lastUsed,
    })
    .from(paymentAccounts)
    .innerJoin(paymentProviders, eq(paymentAccounts.providerId, paymentProviders.id))
    .innerJoin(users, eq(paymentAccounts.userId, users.id))
    .where(
      and(
        eq(paymentAccounts.userId, userId),
        eq(paymentProviders.isActive, true)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function createPaymentAccount(data: NewPaymentAccount): Promise<PaymentAccount> {
  const result = await db
    .insert(paymentAccounts)
    .values({
      ...data,
      lastUsed: new Date()
    })
    .returning();

  return result[0];
}

export async function getPaymentAccountByCustomerId(customerId: string, providerId: string): Promise<PaymentAccount | null> {
  const result = await db
    .select()
    .from(paymentAccounts)
    .where(
      and(
        eq(paymentAccounts.customerId, customerId),
        eq(paymentAccounts.providerId, providerId)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function updatePaymentAccountLastUsed(accountId: string): Promise<void> {
  await db
    .update(paymentAccounts)
    .set({ lastUsed: new Date() })
    .where(eq(paymentAccounts.id, accountId));
}

export async function getActivePaymentProviders(): Promise<OldPaymentProvider[]> {
  const result = await db
    .select()
    .from(paymentProviders)
    .where(eq(paymentProviders.isActive, true))
    .orderBy(paymentProviders.name);

  return result;
}

export async function createPaymentProvider(data: NewPaymentProvider): Promise<OldPaymentProvider> {
  const result = await db
    .insert(paymentProviders)
    .values(data)
    .returning();

  return result[0];
}

export async function updatePaymentProvider(id: string, data: Partial<NewPaymentProvider>): Promise<OldPaymentProvider | null> {
  const result = await db
    .update(paymentProviders)
    .set(data)
    .where(eq(paymentProviders.id, id))
    .returning();

  return result[0] || null;
}

export async function deactivatePaymentProvider(id: string): Promise<OldPaymentProvider | null> {
  const result = await db
    .update(paymentProviders)
    .set({ isActive: false })
    .where(eq(paymentProviders.id, id))
    .returning();

  if (result.length === 0) {
    console.warn(`No payment provider found with ID ${id} to deactivate`);
    return null;
  }

  return result[0];
}

/**
 * Complete function that handles the creation/retrieval of the provider and PaymentAccount
 * 
 * @param providerName - Name of the provider (e.g., 'stripe', 'lemonsqueezy')
 * @param userId - ID of the connected user
 * @param customerId - Customer ID at the provider
 * @param accountId - Account ID at the provider (optional)
 * @returns Promise<PaymentAccount> with complete PaymentAccount data
 */
export async function ensurePaymentAccount(
  providerName: string,
  userId: string,
  customerId: string,
  accountId?: string
): Promise<PaymentAccount> {
  try {
    // 1. Check if the provider exists, if not create it
    let provider = await getPaymentProviderByName(providerName);
    
    if (!provider) {
      console.log(`Provider ${providerName} does not exist, creating...`);
      
      const newProviderData: NewPaymentProvider = {
        name: providerName,
        isActive: true
      };
      
      provider = await createPaymentProvider(newProviderData);
      console.log(`Provider ${providerName} created with ID: ${provider.id}`);
    } else {
      console.log(`Provider ${providerName} found with ID: ${provider.id}`);
    }

    // 2. Check if PaymentAccount already exists for this user and provider
    const paymentAccount = await getPaymentAccountByUserId(userId);
    
    if (paymentAccount && paymentAccount.providerId === provider.id) {
      console.log(`Existing PaymentAccount found for user ${userId} and provider ${providerName}`);
      
      // Update lastUsed and return existing account
      await updatePaymentAccountLastUsed(paymentAccount.id);
      return paymentAccount;
    }

    // 3. Create a new PaymentAccount
    console.log(`Creating a new PaymentAccount for user ${userId} and provider ${providerName}`);
    
    const newPaymentAccountData: NewPaymentAccount = {
      userId,
      providerId: provider.id,
      customerId,
      accountId: accountId || null
    };

    const createdAccount = await createPaymentAccount(newPaymentAccountData);
    console.log(`PaymentAccount created with ID: ${createdAccount.id}`);

    return createdAccount;

  } catch (error) {
    console.error(`Error during PaymentAccount creation/validation:`, error);
    throw new Error(`Unable to create/validate PaymentAccount: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility function to get or create a PaymentAccount with automatic provider management
 * 
 * @param providerName - Name of the provider
 * @param userId - User ID
 * @param customerId - Customer ID at the provider
 * @param accountId - Account ID at the provider (optional)
 * @returns Promise<PaymentAccount> with complete data
 */
export async function getOrCreatePaymentAccount(
  providerName: string,
  userId: string,
  customerId: string,
  accountId?: string
): Promise<PaymentAccount> {
  return ensurePaymentAccount(providerName, userId, customerId, accountId);
}

/**
 * Function to check if a user already has a PaymentAccount for a specific provider
 * 
 * @param providerName - Name of the provider
 * @param userId - User ID
 * @returns Promise<PaymentAccount | null> - The PaymentAccount if it exists, null otherwise
 */
export async function getUserPaymentAccountByProvider(
  userId: string,
  providerName: string
): Promise<PaymentAccount | null> {
  try {
    // Get the provider
    const provider = await getPaymentProviderByName(providerName);
    if (!provider) {
      return null; // Provider does not exist
    }

    // Get the PaymentAccount
    const paymentAccount = await getPaymentAccountByUserId(userId);
    
    if (paymentAccount && paymentAccount.providerId === provider.id) {
      return paymentAccount;
    }

    return null;
  } catch (error) {
    console.error(`Error checking PaymentAccount:`, error);
    return null;
  }
}

/**
 * Get client account by email (credentials provider only)
 */
export async function getClientAccountByEmail(email: string): Promise<any> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get credentials account specifically (not OAuth accounts)
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, "credentials" as any),
          eq(accounts.email, normalizedEmail)
        )
      )
      .limit(1);

    return account || null;
  } catch (error) {
    console.error("Error getting client account by email:", error);
    return null;
  }
}

/**
 * Check if user has access to client routes (has account record)
 */
export async function hasClientAccess(userId: string): Promise<boolean> {
  try {
    // Check if account exists for the user (userId references client_profiles.id)
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    return !!account;
  } catch (error) {
    console.error("Error checking client access:", error);
    return false;
  }
}

/**
 * Verify client password
 */
export async function verifyClientPassword(email: string, password: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get credentials account specifically (not OAuth accounts)
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, "credentials" as any),
          eq(accounts.email, normalizedEmail)
        )
      )
      .limit(1);
    
    if (!account) {
      return false;
    }
    
    if (!account.passwordHash) {
      return false;
    }
    
    const isValid = await comparePasswords(password, account.passwordHash);
    
    return isValid;
  } catch (error) {
    console.error("Error verifying client password:", error);
    return false;
  }
}

export async function setupUserPaymentAccount(
  providerName: string,
  userId: string,
  customerId: string,
  accountId?: string
): Promise<PaymentAccount> {
  try {
    let provider = await getPaymentProviderByName(providerName);
    if (!provider) {
      const newProviderData: NewPaymentProvider = {
        name: providerName,
        isActive: true
      };
      
      provider = await createPaymentProvider(newProviderData);
      console.log(`✅ Provider ${providerName} created with ID: ${provider.id}`);
    } else {
      console.log(`✅ Provider ${providerName} found with ID: ${provider.id}`);
    }

    // Check if payment account already exists for this user and provider
    const existingAccount = await getUserPaymentAccountByProvider(userId, providerName);
    
    if (existingAccount) {
      console.log(`✅ Payment account already exists for user ${userId} and provider ${providerName}`);
      // Update the existing account with new customerId if different
      if (existingAccount.customerId !== customerId) {
        console.log(`🔄 Updating customer ID from ${existingAccount.customerId} to ${customerId}`);
        // Update the payment account directly in the database
        await db
          .update(paymentAccounts)
          .set({ 
            customerId, 
            accountId: accountId || existingAccount.accountId,
            lastUsed: new Date(),
            updatedAt: new Date()
          })
          .where(eq(paymentAccounts.id, existingAccount.id));
        
        return await getUserPaymentAccountByProvider(userId, providerName) as PaymentAccount;
      }
      // Update last used timestamp
      await updatePaymentAccountLastUsed(existingAccount.id);
      return existingAccount;
    }

    // Create new payment account
    const newPaymentAccountData: NewPaymentAccount = {
      userId,
      providerId: provider.id,
      customerId,
      accountId: accountId || null
    };

    console.log(`🆕 Creating new payment account for user ${userId} and provider ${providerName}`);
    const createdAccount = await createPaymentAccount(newPaymentAccountData);
    return createdAccount;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const fullError = `Unable to configure PaymentAccount for ${providerName} - ${errorMessage}`;
    
    console.error(`💥 Error details:`, {
      providerName,
      userId,
      customerId,
      accountId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw new Error(fullError);
  }
}

export async function createOrGetPaymentAccount(
  providerName: string,
  userId: string,
  customerId: string,
  accountId?: string
): Promise<PaymentAccount> {
  return setupUserPaymentAccount(providerName, userId, customerId, accountId);
}
// ######################### Subscription Queries #########################

/**
 * Get subscription by user ID and subscription ID
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

export async function updateSubscriptionBySubscriptionId(
	updateData: Partial<NewSubscription>
): Promise<Subscription | null> {
	const result = await db
		.update(subscriptions)
		.set({ ...updateData, updatedAt: new Date() })
		.where(eq(subscriptions.subscriptionId, updateData.subscriptionId!));

	return result[0] || null;
}

// ######################### Activity Log Queries #########################

/**
 * Get the last login activity for a client
 */
export async function getLastLoginActivity(clientId: string): Promise<ActivityLog | null> {
	const [lastLogin] = await db
		.select()
		.from(activityLogs)
		.where(
			and(
				eq(activityLogs.clientId, clientId),
				eq(activityLogs.action, ActivityType.SIGN_IN)
			)
		)
		.orderBy(desc(activityLogs.timestamp))
		.limit(1);

	return lastLogin || null;
}

/**
 * Get optimized admin dashboard data with clients and statistics in a single query
 * This reduces database round trips and improves dashboard performance
 */
export async function getAdminDashboardData(params: {
	page: number;
	limit: number;
	// Basic filters
	search?: string;
	status?: string;
	plan?: string;
	accountType?: string;
	provider?: string;
	// Date range filters
	createdAfter?: Date;
	createdBefore?: Date;
	updatedAfter?: Date;
	updatedBefore?: Date;
}): Promise<{
	clients: ClientProfileWithAuth[];
	stats: {
		overview: {
			total: number;
			active: number;
			inactive: number;
			suspended: number;
			trial: number;
		};
		byProvider: {
			credentials: number;
			google: number;
			github: number;
			facebook: number;
			twitter: number;
			linkedin: number;
			other: number;
		};
		byPlan: Record<string, number>;
		byAccountType: Record<string, number>;
		byStatus: Record<string, number>;
		activity: {
			newThisWeek: number;
			newThisMonth: number;
			activeThisWeek: number;
			activeThisMonth: number;
		};
		growth: {
			weeklyGrowth: number;
			monthlyGrowth: number;
		};
	};
	pagination: {
		page: number;
		totalPages: number;
		total: number;
		limit: number;
	};
}> {
	const { page, limit, search, status, plan, accountType, provider, createdAfter, createdBefore, updatedAfter, updatedBefore } = params;
	const offset = (page - 1) * limit;

	const whereConditions: SQL[] = [];

	// Optimized search with proper escaping and index-friendly patterns
	if (search) {
		const escapedSearch = search.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');
		// Use ILIKE for case-insensitive search with proper escaping
		whereConditions.push(
			sql`(${clientProfiles.username} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.displayName} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.company} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.name} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.email} ILIKE ${`%${escapedSearch}%`})`
		);
	}

	// Add filters with proper type casting for enum values
	if (status) {
		whereConditions.push(eq(clientProfiles.status, status as ClientStatus));
	}

	if (plan) {
		whereConditions.push(eq(clientProfiles.plan, plan as ClientPlan));
	}

	if (accountType) {
		whereConditions.push(eq(clientProfiles.accountType, accountType as ClientAccountType));
	}

	if (provider) {
		whereConditions.push(eq(accounts.provider, provider));
	}

	// Date range filters
	if (createdAfter) {
		whereConditions.push(gte(clientProfiles.createdAt, createdAfter));
	}

	if (createdBefore) {
		whereConditions.push(lte(clientProfiles.createdAt, createdBefore));
	}

	if (updatedAfter) {
		whereConditions.push(gte(clientProfiles.updatedAt, updatedAfter));
	}

	if (updatedBefore) {
		whereConditions.push(lte(clientProfiles.updatedAt, updatedBefore));
	}

	const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

	// Optimized count query with join
	const countResult = await db
		.select({ count: sql<number>`count(distinct ${clientProfiles.id})` })
		.from(clientProfiles)
		.leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(whereClause ? and(whereClause, isNull(roles.id)) : isNull(roles.id));

	const total = Number((countResult[0] as unknown as { count: number })?.count || 0);

	// Optimized profile query with selective field selection and proper ordering
	const profiles = await db
		.select({
			// Client profile fields - only select what's needed
			id: clientProfiles.id,
			userId: clientProfiles.userId,
			email: clientProfiles.email,
			name: clientProfiles.name,
			displayName: clientProfiles.displayName,
			username: clientProfiles.username,
			bio: clientProfiles.bio,
			jobTitle: clientProfiles.jobTitle,
			company: clientProfiles.company,
			industry: clientProfiles.industry,
			phone: clientProfiles.phone,
			website: clientProfiles.website,
			location: clientProfiles.location,
			avatar: clientProfiles.avatar,
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
			// Account fields
			accountProvider: sql<string>`coalesce(${accounts.provider}, 'unknown')`,
		})
		.from(clientProfiles)
		.leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(whereClause ? and(whereClause, isNull(roles.id)) : isNull(roles.id))
		.orderBy(desc(clientProfiles.createdAt)) // Use indexed field for ordering
		.limit(limit)
		.offset(offset);

	// Transform to enhanced type with proper defaults
	const enhancedProfiles: ClientProfileWithAuth[] = profiles.map((profile: typeof profiles[0]) => ({
		...profile,
		accountType: profile.accountType || 'individual',
		isActive: profile.status === 'active',
	}));

	// Get actual stats
	const stats = await getEnhancedClientStats();

	return {
		clients: enhancedProfiles,
		stats,
		pagination: {
			page,
			totalPages: Math.ceil(total / limit),
			total,
			limit
		}
	};
}

/**
 * Advanced search with multiple criteria and complex filtering
 * Supports date ranges, multiple search fields, and saved filter presets
 */
export async function advancedClientSearch(params: {
	page: number;
	limit: number;
	// Basic filters
	search?: string;
	status?: string;
	plan?: string;
	accountType?: string;
	provider?: string;
	// Advanced filters
	dateRange?: {
		startDate?: Date;
		endDate?: Date;
	};
	createdAfter?: Date;
	createdBefore?: Date;
	updatedAfter?: Date;
	updatedBefore?: Date;
	// Field-specific searches
	emailDomain?: string;
	companySearch?: string;
	locationSearch?: string;
	industrySearch?: string;
	// Numeric filters
	minSubmissions?: number;
	maxSubmissions?: number;
	// Boolean filters
	hasAvatar?: boolean;
	hasWebsite?: boolean;
	hasPhone?: boolean;
	emailVerified?: boolean;
	twoFactorEnabled?: boolean;
	// Sort options
	sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email' | 'company' | 'totalSubmissions';
	sortOrder?: 'asc' | 'desc';
}): Promise<{
	clients: ClientProfileWithAuth[];
	pagination: {
		page: number;
		totalPages: number;
		total: number;
		limit: number;
	};
	searchMetadata: {
		appliedFilters: string[];
		searchTime: number;
		resultCount: number;
	};
}> {
	const {
		page,
		limit,
		search,
		status,
		plan,
		accountType,
		provider,
		dateRange,
		createdAfter,
		createdBefore,
		updatedAfter,
		updatedBefore,
		emailDomain,
		companySearch,
		locationSearch,
		industrySearch,
		minSubmissions,
		maxSubmissions,
		hasAvatar,
		hasWebsite,
		hasPhone,
		emailVerified,
		twoFactorEnabled,
		sortBy = 'createdAt',
		sortOrder = 'desc'
	} = params;

	const offset = (page - 1) * limit;
	const whereConditions: SQL[] = [];
	const appliedFilters: string[] = [];

	// Basic text search across multiple fields
	if (search) {
		const escapedSearch = search.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');
		whereConditions.push(
			sql`(${clientProfiles.username} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.displayName} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.company} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.name} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.email} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.bio} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.jobTitle} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.industry} ILIKE ${`%${escapedSearch}%`} OR
           ${clientProfiles.location} ILIKE ${`%${escapedSearch}%`})`
		);
		appliedFilters.push(`Search: "${search}"`);
	}

	// Status filter
	if (status) {
		whereConditions.push(eq(clientProfiles.status, status as ClientStatus));
		appliedFilters.push(`Status: ${status}`);
	}

	// Plan filter
	if (plan) {
		whereConditions.push(eq(clientProfiles.plan, plan as ClientPlan));
		appliedFilters.push(`Plan: ${plan}`);
	}

	// Account type filter
	if (accountType) {
		whereConditions.push(eq(clientProfiles.accountType, accountType as ClientAccountType));
		appliedFilters.push(`Type: ${accountType}`);
	}

	// Provider filter
	if (provider) {
		whereConditions.push(eq(accounts.provider, provider));
		appliedFilters.push(`Provider: ${provider}`);
	}

	// Date range filters
	if (dateRange?.startDate) {
		whereConditions.push(gte(clientProfiles.createdAt, dateRange.startDate));
		appliedFilters.push(`Created after: ${dateRange.startDate.toLocaleDateString()}`);
	}

	if (dateRange?.endDate) {
		whereConditions.push(lte(clientProfiles.createdAt, dateRange.endDate));
		appliedFilters.push(`Created before: ${dateRange.endDate.toLocaleDateString()}`);
	}

	if (createdAfter) {
		whereConditions.push(gte(clientProfiles.createdAt, createdAfter));
		appliedFilters.push(`Created after: ${createdAfter.toLocaleDateString()}`);
	}

	if (createdBefore) {
		whereConditions.push(lte(clientProfiles.createdAt, createdBefore));
		appliedFilters.push(`Created before: ${createdBefore.toLocaleDateString()}`);
	}

	if (updatedAfter) {
		whereConditions.push(gte(clientProfiles.updatedAt, updatedAfter));
		appliedFilters.push(`Updated after: ${updatedAfter.toLocaleDateString()}`);
	}

	if (updatedBefore) {
		whereConditions.push(lte(clientProfiles.updatedAt, updatedBefore));
		appliedFilters.push(`Updated before: ${updatedBefore.toLocaleDateString()}`);
	}

	// Field-specific searches
	if (emailDomain) {
		whereConditions.push(sql`${clientProfiles.email} ILIKE ${`%@${emailDomain}%`}`);
		appliedFilters.push(`Email domain: ${emailDomain}`);
	}

	if (companySearch) {
		const escapedCompany = companySearch.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');
		whereConditions.push(sql`${clientProfiles.company} ILIKE ${`%${escapedCompany}%`}`);
		appliedFilters.push(`Company: "${companySearch}"`);
	}

	if (locationSearch) {
		const escapedLocation = locationSearch.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');
		whereConditions.push(sql`${clientProfiles.location} ILIKE ${`%${escapedLocation}%`}`);
		appliedFilters.push(`Location: "${locationSearch}"`);
	}

	if (industrySearch) {
		const escapedIndustry = industrySearch.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');
		whereConditions.push(sql`${clientProfiles.industry} ILIKE ${`%${escapedIndustry}%`}`);
		appliedFilters.push(`Industry: "${industrySearch}"`);
	}

	// Numeric filters
	if (minSubmissions !== undefined) {
		whereConditions.push(gte(clientProfiles.totalSubmissions, minSubmissions));
		appliedFilters.push(`Min submissions: ${minSubmissions}`);
	}

	if (maxSubmissions !== undefined) {
		whereConditions.push(lte(clientProfiles.totalSubmissions, maxSubmissions));
		appliedFilters.push(`Max submissions: ${maxSubmissions}`);
	}

	// Boolean filters
	if (hasAvatar !== undefined) {
		if (hasAvatar) {
			whereConditions.push(sql`${clientProfiles.avatar} IS NOT NULL AND ${clientProfiles.avatar} != ''`);
		} else {
			whereConditions.push(sql`(${clientProfiles.avatar} IS NULL OR ${clientProfiles.avatar} = '')`);
		}
		appliedFilters.push(`Has avatar: ${hasAvatar}`);
	}

	if (hasWebsite !== undefined) {
		if (hasWebsite) {
			whereConditions.push(sql`${clientProfiles.website} IS NOT NULL AND ${clientProfiles.website} != ''`);
		} else {
			whereConditions.push(sql`(${clientProfiles.website} IS NULL OR ${clientProfiles.website} = '')`);
		}
		appliedFilters.push(`Has website: ${hasWebsite}`);
	}

	if (hasPhone !== undefined) {
		if (hasPhone) {
			whereConditions.push(sql`${clientProfiles.phone} IS NOT NULL AND ${clientProfiles.phone} != ''`);
		} else {
			whereConditions.push(sql`(${clientProfiles.phone} IS NULL OR ${clientProfiles.phone} = '')`);
		}
		appliedFilters.push(`Has phone: ${hasPhone}`);
	}

	if (emailVerified !== undefined) {
		whereConditions.push(eq(clientProfiles.emailVerified, emailVerified));
		appliedFilters.push(`Email verified: ${emailVerified}`);
	}

	if (twoFactorEnabled !== undefined) {
		whereConditions.push(eq(clientProfiles.twoFactorEnabled, twoFactorEnabled));
		appliedFilters.push(`2FA enabled: ${twoFactorEnabled}`);
	}

	const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

	// Get total count
	const countResult = await db
		.select({ count: sql<number>`count(distinct ${clientProfiles.id})` })
		.from(clientProfiles)
		.leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(whereClause ? and(whereClause, isNull(roles.id)) : isNull(roles.id));

	const total = Number((countResult[0] as unknown as { count: number })?.count || 0);

	// Build sort clause
	let sortClause;
	switch (sortBy) {
		case 'createdAt':
			sortClause = sortOrder === 'asc' ? asc(clientProfiles.createdAt) : desc(clientProfiles.createdAt);
			break;
		case 'updatedAt':
			sortClause = sortOrder === 'asc' ? asc(clientProfiles.updatedAt) : desc(clientProfiles.updatedAt);
			break;
		case 'name':
			sortClause = sortOrder === 'asc' ? asc(clientProfiles.name) : desc(clientProfiles.name);
			break;
		case 'email':
			sortClause = sortOrder === 'asc' ? asc(clientProfiles.email) : desc(clientProfiles.email);
			break;
		case 'company':
			sortClause = sortOrder === 'asc' ? asc(clientProfiles.company) : desc(clientProfiles.company);
			break;
		case 'totalSubmissions':
			sortClause = sortOrder === 'asc' ? asc(clientProfiles.totalSubmissions) : desc(clientProfiles.totalSubmissions);
			break;
		default:
			sortClause = desc(clientProfiles.createdAt);
	}

	// Get profiles with sorting
	const profiles = await db
		.select({
			id: clientProfiles.id,
			userId: clientProfiles.userId,
			email: clientProfiles.email,
			name: clientProfiles.name,
			displayName: clientProfiles.displayName,
			username: clientProfiles.username,
			bio: clientProfiles.bio,
			jobTitle: clientProfiles.jobTitle,
			company: clientProfiles.company,
			industry: clientProfiles.industry,
			phone: clientProfiles.phone,
			website: clientProfiles.website,
			location: clientProfiles.location,
			avatar: clientProfiles.avatar,
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
			accountProvider: sql<string>`coalesce(${accounts.provider}, 'unknown')`,
		})
		.from(clientProfiles)
		.leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
		.leftJoin(userRoles, eq(userRoles.userId, clientProfiles.userId))
		.leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isAdmin, true)))
		.where(whereClause ? and(whereClause, isNull(roles.id)) : isNull(roles.id))
		.orderBy(sortClause)
		.limit(limit)
		.offset(offset);

	// Transform to enhanced type
	const enhancedProfiles: ClientProfileWithAuth[] = profiles.map((profile: typeof profiles[0]) => ({
		...profile,
		accountType: profile.accountType || 'individual',
		isActive: profile.status === 'active',
	}));

	return {
		clients: enhancedProfiles,
		pagination: {
			page,
			totalPages: Math.ceil(total / limit),
			total,
			limit
		},
		searchMetadata: {
			appliedFilters,
			searchTime: Date.now(),
			resultCount: total
		}
	};
}