/*
  Seed script to insert realistic local data into the database.
  Usage: DATABASE_URL=... yarn seed
*/

import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
  users,
  roles,
  userRoles,
  clientProfiles,
  activityLogs,
  comments,
  votes,
  newsletterSubscriptions,
  type NewUser,
  type NewClientProfile,
  type NewRole,
  type NewUserRole,
  VoteType
} from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required to run the seed script.');
    process.exit(1);
  }

  const conn = postgres(databaseUrl, { max: 1 });
  const db = drizzle(conn);

  // Seed roles (admin, user)
  const existingRoles = await db.select().from(roles).limit(1);
  if (existingRoles.length === 0) {
    const roleRows: NewRole[] = [
      {
        id: 'role-admin',
        name: 'admin',
        description: 'Administrator role',
        status: 'active',
        permissions: JSON.stringify(['*']),
        is_admin: true,
        created_by: 'system'
      },
      {
        id: 'role-user',
        name: 'user',
        description: 'Standard user role',
        status: 'active',
        permissions: JSON.stringify(['read']),
        is_admin: false,
        created_by: 'system'
      }
    ];
    await db.insert(roles).values(roleRows);
    console.log('Seeded roles');
  }

  // Seed users
  const usersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const totalUsers = Number(usersCount[0]?.count ?? 0);

  if (totalUsers === 0) {
    const now = new Date();
    const userRows: NewUser[] = Array.from({ length: 20 }).map((_, i) => ({
      id: crypto.randomUUID(),
      email: `user${i + 1}@example.com`,
      emailVerified: now,
      passwordHash: null,
      createdAt: new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000),
      updatedAt: now,
      deletedAt: null
    }));
    await db.insert(users).values(userRows);
    console.log('Seeded users');

    // Client profiles
    const profileRows: NewClientProfile[] = userRows.map((u, i) => ({
      id: crypto.randomUUID(),
      userId: u.id,
      email: u.email!,
      name: `User ${i + 1}`,
      displayName: `User ${i + 1}`,
      username: `user${i + 1}`,
      bio: i % 3 === 0 ? 'Power user' : null,
      jobTitle: i % 2 === 0 ? 'Developer' : 'Designer',
      company: i % 2 === 0 ? 'Acme Inc.' : 'Globex',
      industry: 'Software',
      phone: null,
      website: null,
      location: 'Remote',
      avatar: null,
      accountType: 'individual',
      status: 'active',
      plan: i % 5 === 0 ? 'premium' : i % 3 === 0 ? 'standard' : 'free',
      timezone: 'UTC',
      language: 'en',
      twoFactorEnabled: false,
      emailVerified: true,
      totalSubmissions: Math.floor(Math.random() * 10),
      notes: null,
      tags: null,
      createdAt: now,
      updatedAt: now
    }));
    await db.insert(clientProfiles).values(profileRows);
    console.log('Seeded client profiles');

    // Assign roles: first user is admin
    const userRoleRows: NewUserRole[] = userRows.map((u, i) => ({
      userId: u.id,
      roleId: i === 0 ? 'role-admin' : 'role-user',
      createdAt: now
    }));
    await db.insert(userRoles).values(userRoleRows);
    console.log('Assigned user roles');

    // Newsletter subscriptions (every 3rd user)
    const newsletterRows = userRows
      .filter((_, i) => i % 3 === 0)
      .map((u) => ({
        id: crypto.randomUUID(),
        email: u.email!,
        isActive: true,
        subscribedAt: now,
        unsubscribedAt: null,
        lastEmailSent: null,
        source: 'seed'
      }));
    if (newsletterRows.length) {
      await db.insert(newsletterSubscriptions).values(newsletterRows);
      console.log('Seeded newsletter subscriptions');
    }

    // Activity logs
    const profileIds = await db.select({ id: clientProfiles.id }).from(clientProfiles);
    const activityRows = profileIds.slice(0, 30).map((p, i) => ({
      userId: p.id,
      action: i % 4 === 0 ? 'SIGN_UP' : i % 4 === 1 ? 'SIGN_IN' : i % 4 === 2 ? 'COMMENT' : 'VOTE',
      timestamp: new Date(now.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
      ipAddress: '127.0.0.1'
    }));
    if (activityRows.length) {
      await db.insert(activityLogs).values(activityRows);
      console.log('Seeded activity logs');
    }

    // Comments and votes (lightweight)
    const commentRows = profileIds.slice(0, 15).map((p, i) => ({
      id: crypto.randomUUID(),
      content: `This is a sample comment ${i + 1}`,
      userId: p.id,
      itemId: `item-${(i % 5) + 1}`,
      rating: (i % 5) + 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    }));
    if (commentRows.length) {
      await db.insert(comments).values(commentRows);
      console.log('Seeded comments');
    }

    const voteRows = profileIds.slice(0, 25).map((p, i) => ({
      id: crypto.randomUUID(),
      userId: p.id,
      itemId: `item-${(i % 5) + 1}`,
      voteType: i % 4 === 0 ? VoteType.DOWNVOTE : VoteType.UPVOTE,
      createdAt: now,
      updatedAt: now
    }));
    if (voteRows.length) {
      await db.insert(votes).values(voteRows);
      console.log('Seeded votes');
    }
  }

  await conn.end({ timeout: 1 });
  console.log('Seed complete');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});


