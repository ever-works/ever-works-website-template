import { and, eq, desc, sql, isNull, or, gte, countDistinct, type SQL } from 'drizzle-orm';
import { db } from '../drizzle';
import {
  clientProfiles,
  accounts,
  userRoles,
  roles,
  type ClientProfile,
  type NewClientProfile
} from '../schema';
import type { ClientStatus, ClientPlan, ClientAccountType, ClientProfileWithAuth } from './types';
import { extractUsernameFromEmail, ensureUniqueUsername } from './utils';
import { getUserByEmail, insertNewUser, type NewUser } from './user.queries';
import { comparePasswords } from '@/lib/auth/credentials';

// ===================== Client User Creation =====================

/**
 * Create a new client user (creates user record but marks as client)
 * @param name - Client name
 * @param email - Client email
 * @returns Created user or null if error/exists
 */
export async function createClientUser(name: string, email: string): Promise<unknown> {
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
      email: normalizedEmail
      // No passwordHash - clients store passwords in accounts table
    };

    const [createdUser] = await insertNewUser(newUser);
    return createdUser || null;
  } catch (error) {
    console.error('Error creating client user:', error);
    return null;
  }
}

// ===================== Client Profile CRUD =====================

/**
 * Create a new client profile
 * @param data - Client profile data
 * @returns Created client profile
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
    jobTitle: data.jobTitle || 'User',
    company: data.company || 'Unknown',
    status: (data.status as 'active' | 'inactive' | 'suspended' | 'trial') || 'active',
    plan: (data.plan as 'free' | 'standard' | 'premium') || 'free',
    accountType: (data.accountType as 'individual' | 'business' | 'enterprise') || 'individual'
  };

  const [profile] = await db.insert(clientProfiles).values(insertData).returning();

  return profile;
}

/**
 * Find client profile by ID
 * @param id - Client profile ID
 * @returns Client profile or null if not found
 */
export async function getClientProfileById(id: string): Promise<ClientProfile | null> {
  const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.id, id));

  return profile || null;
}

/**
 * Find client profile by user ID
 * @param userId - User ID
 * @returns Client profile or null if not found
 */
export async function getClientProfileByUserId(userId: string): Promise<ClientProfile | null> {
  const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.userId, userId));

  return profile || null;
}

/**
 * Find client profile by email
 * @param email - Client email
 * @returns Client profile or null if not found
 */
export async function getClientProfileByEmail(email: string): Promise<ClientProfile | null> {
  // Resolve deterministic profile via accounts (accounts.email will be unique after migration)
  const account = await getClientAccountByEmail(email);
  if (!account) return null;

  const [profile] = await db.select().from(clientProfiles).where(eq(clientProfiles.id, account.userId)).limit(1);

  return profile || null;
}

/**
 * Update client profile
 * @param id - Client profile ID
 * @param data - Partial client profile data to update
 * @returns Updated client profile or null if not found
 */
export async function updateClientProfile(
  id: string,
  data: Partial<NewClientProfile>
): Promise<ClientProfile | null> {
  const [profile] = await db
    .update(clientProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clientProfiles.id, id))
    .returning();

  return profile || null;
}

/**
 * Delete client profile
 * @param id - Client profile ID
 * @returns True if deleted, false otherwise
 */
export async function deleteClientProfile(id: string): Promise<boolean> {
  const [profile] = await db.delete(clientProfiles).where(eq(clientProfiles.id, id)).returning();

  return !!profile;
}

// ===================== Client Profile Listing & Search =====================

/**
 * Get all client profiles with pagination and authentication data
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated client profiles with metadata
 */
export async function getClientProfiles(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  accountType?: string;
  provider?: string;
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
      accountProvider: sql<string>`coalesce(${accounts.provider}, 'unknown')`
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
  const enhancedProfiles: ClientProfileWithAuth[] = profiles.map((profile: (typeof profiles)[0]) => ({
    ...profile,
    accountType: profile.accountType || 'individual',
    isActive: profile.status === 'active'
  }));

  return {
    profiles: enhancedProfiles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit
  };
}

// ===================== Client Statistics =====================

/**
 * Get client profile statistics (basic)
 * @returns Basic client statistics
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
 * Get comprehensive client statistics with multiple dimensions
 * Returns detailed analytics including provider distribution, plan analysis, and activity metrics
 * @returns Enhanced client statistics
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
      count: countDistinct(clientProfiles.id)
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
    const status = row.status || 'active'; // Use a valid default
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
    if (knownProviders.includes(provider as (typeof knownProviders)[number])) {
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
        or(gte(clientProfiles.updatedAt, oneWeekAgo), gte(clientProfiles.createdAt, oneWeekAgo))
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
        or(gte(clientProfiles.updatedAt, oneMonthAgo), gte(clientProfiles.createdAt, oneMonthAgo))
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
      trial: byStatus.trial
    },
    byProvider,
    byPlan,
    byAccountType,
    byStatus,
    activity: {
      newThisWeek,
      newThisMonth,
      activeThisWeek,
      activeThisMonth
    },
    growth: {
      weeklyGrowth,
      monthlyGrowth
    }
  };
}

// ===================== Client Account Management =====================

/**
 * Get client account by email (credentials provider only)
 * @param email - Client email
 * @returns Account or null if not found
 */
export async function getClientAccountByEmail(email: string): Promise<unknown> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Get credentials account specifically (not OAuth accounts)
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.provider, 'credentials'), eq(accounts.email, normalizedEmail)))
      .limit(1);

    return account || null;
  } catch (error) {
    console.error('Error getting client account by email:', error);
    return null;
  }
}

/**
 * Create account record for client with password
 * @param userId - User ID (optional, will be resolved from email if not provided)
 * @param email - Client email
 * @param passwordHash - Hashed password (optional)
 * @returns Created account or null if error
 */
export async function createClientAccount(
  userId: string | undefined,
  email: string,
  passwordHash?: string | null
): Promise<unknown> {
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
      .where(and(eq(accounts.provider, 'credentials'), eq(accounts.email, normalizedEmail)))
      .limit(1);

    if (existing) {
      return existing;
    }

    // Create account record for client
    const newAccount = {
      userId: resolvedUserId, // Must reference client_profiles.id
      type: 'credentials' as const,
      provider: 'credentials',
      providerAccountId: crypto.randomUUID(), // Opaque stable identifier per provider
      email: normalizedEmail,
      passwordHash: passwordHash || null,
      refresh_token: null,
      access_token: null,
      expires_at: null,
      token_type: null,
      scope: null,
      id_token: null,
      session_state: null
    };

    const [account] = await db.insert(accounts).values(newAccount).returning();

    return account || null;
  } catch (error) {
    console.error('Error creating client account:', error);
    return null;
  }
}

/**
 * Check if user has access to client routes (has account record)
 * @param userId - User ID
 * @returns True if user has client access, false otherwise
 */
export async function hasClientAccess(userId: string): Promise<boolean> {
  try {
    // Check if account exists for the user (userId references client_profiles.id)
    const [account] = await db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1);

    return !!account;
  } catch (error) {
    console.error('Error checking client access:', error);
    return false;
  }
}

/**
 * Verify client password
 * @param email - Client email
 * @param password - Plain text password to verify
 * @returns True if password is valid, false otherwise
 */
export async function verifyClientPassword(email: string, password: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Get credentials account specifically (not OAuth accounts)
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.provider, 'credentials'), eq(accounts.email, normalizedEmail)))
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
    console.error('Error verifying client password:', error);
    return false;
  }
}
