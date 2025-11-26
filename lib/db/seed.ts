import bcrypt from 'bcryptjs';

// Import schema types and sql
import {
  users,
  accounts,
  clientProfiles,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  comments,
  activityLogs,
  favorites,
  verificationTokens,
  sessions,
  authenticators,
  passwordResetTokens,
  subscriptions,
  subscriptionHistory,
  paymentAccounts,
  paymentProviders,
  seedStatus
} from './schema';
import { getAllPermissions } from '../permissions/definitions';
import { sql, eq } from 'drizzle-orm';

// Global database connection - will be initialized after environment loading
let db: any;

async function ensureDb() {
  // Quick sanity check similar to drizzle.ts behavior
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Aborting seed to prevent accidental DummyDb operations.');
  }
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DB_SEED !== '1') {
    throw new Error('Refusing to seed in production. Set ALLOW_DB_SEED=1 to proceed.');
  }
  
  // Initialize database connection
  const { db: dbConnection } = await import('./drizzle');
  db = dbConnection;
}

function uuid(): string {
  return crypto.randomUUID();
}

async function tableExists(name: string): Promise<boolean> {
  const res: any = await db.execute(
    sql`SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND lower(table_name) = lower(${name})
        LIMIT 1`
  );
  // postgres-js returns { rows: [...] }
  const rows = (res as any).rows ?? (Array.isArray(res) ? res : []);
  return rows.length > 0;
}

async function wipeData() {
  // Delete in FK-safe order (children → parents), guard for non-existent tables
  if (await tableExists('subscriptionHistory')) await db.delete(subscriptionHistory);
  if (await tableExists('subscriptions')) await db.delete(subscriptions);
  if (await tableExists('favorites')) await db.delete(favorites);
  if (await tableExists('activityLogs')) await db.delete(activityLogs);
  if (await tableExists('comments')) await db.delete(comments);
  if (await tableExists('authenticators')) await db.delete(authenticators);
  if (await tableExists('sessions')) await db.delete(sessions);
  if (await tableExists('verificationTokens')) await db.delete(verificationTokens);
  if (await tableExists('passwordResetTokens')) await db.delete(passwordResetTokens);
  if (await tableExists('paymentAccounts')) await db.delete(paymentAccounts);
  if (await tableExists('paymentProviders')) await db.delete(paymentProviders);
  if (await tableExists('role_permissions')) await db.delete(rolePermissions);
  if (await tableExists('user_roles')) await db.delete(userRoles);
  if (await tableExists('accounts')) await db.delete(accounts);
  if (await tableExists('client_profiles')) await db.delete(clientProfiles);
  if (await tableExists('users')) await db.delete(users);
  if (await tableExists('roles')) await db.delete(roles);
  if (await tableExists('permissions')) await db.delete(permissions);
}

async function seedCoreRBAC() {
  const hasPermissions = await tableExists('permissions');
  const hasRoles = await tableExists('roles');
  const hasRolePermissions = await tableExists('role_permissions');

  if (!hasPermissions || !hasRoles) {
    console.log('Skipping RBAC seed (permissions/roles tables missing)');
    return { roleAdminId: '', roleClientId: '' };
  }

  // Get all available permissions from definitions
  const allPermissions = getAllPermissions();

  // Create permission records with UUIDs
  const permissionRecords = allPermissions.map(permission => ({
    id: uuid(),
    key: permission,
    description: permission.replace(':', ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  }));

  await db.insert(permissions).values(permissionRecords);

  // Roles
  const roleAdminId = uuid();
  const roleClientId = uuid();

  await db.insert(roles).values([
    { id: roleAdminId, name: 'admin', description: 'Administrator', isAdmin: true },
    { id: roleClientId, name: 'client', description: 'Client user', isAdmin: false }
  ]);

  // Role-Permissions: Give admin role ALL permissions
  if (hasRolePermissions) {
    const adminRolePermissions = permissionRecords.map(perm => ({
      roleId: roleAdminId,
      permissionId: perm.id
    }));

    await db.insert(rolePermissions).values(adminRolePermissions);
  }

  return { roleAdminId, roleClientId };
}

async function seedUsersAndProfiles(roleAdminId: string, roleClientId: string) {
  const hasUsers = await tableExists('users');
  const hasAccounts = await tableExists('accounts');
  const hasClientProfiles = await tableExists('client_profiles');
  const hasUserRoles = await tableExists('user_roles');

  if (!hasUsers) {
    console.log('Skipping user/profile seed (users table missing)');
    return { adminProfileId: '', clientProfileId1: '', clientProfileId2: '', adminUserId: '', clientUserId1: '', clientUserId2: '' };
  }
  const adminUserId = uuid();
  const clientUserId1 = uuid();
  const clientUserId2 = uuid();

  // Users (one credentials admin, one credentials client, one OAuth client)
  const hashed = await bcrypt.hash('Passw0rd123!', 10);
  await db.insert(users).values([
    {
      id: adminUserId,
      email: 'admin@example.com',
      passwordHash: hashed
    },
    {
      id: clientUserId1,
      email: 'client1@example.com',
      passwordHash: hashed
    },
    {
      id: clientUserId2,
      email: 'client2@example.com'
    }
  ]);

  // Accounts (credentials for admin and client1; oauth for client2)
  if (hasAccounts) {
    await db.insert(accounts).values([
      { userId: adminUserId, type: 'email', provider: 'credentials', providerAccountId: 'admin@example.com', email: 'admin@example.com', passwordHash: hashed },
      { userId: clientUserId1, type: 'email', provider: 'credentials', providerAccountId: 'client1@example.com', email: 'client1@example.com', passwordHash: hashed },
      { userId: clientUserId2, type: 'oauth', provider: 'google', providerAccountId: 'google-oauth-123' }
    ]);
  }

  // Client Profiles
  const clientProfileId1 = uuid();
  const clientProfileId2 = uuid();
  const adminProfileId = uuid();

  if (hasClientProfiles) {
    // Use explicit SQL to avoid mismatches with optional columns present in code schema but not in DB
    await db.execute(sql`
      INSERT INTO client_profiles (id, "userId", email, name)
      VALUES
        (${adminProfileId}, ${adminUserId}, 'admin@example.com', 'Admin User'),
        (${clientProfileId1}, ${clientUserId1}, 'client1@example.com', 'Client One'),
        (${clientProfileId2}, ${clientUserId2}, 'client2@example.com', 'Client Two')
    `);
  }

  // User Roles
  if (hasUserRoles && roleAdminId && roleClientId) {
    await db.insert(userRoles).values([
      { userId: adminUserId, roleId: roleAdminId },
      { userId: clientUserId1, roleId: roleClientId },
      { userId: clientUserId2, roleId: roleClientId }
    ]);
  }

  return { adminProfileId, clientProfileId1, clientProfileId2, adminUserId, clientUserId1, clientUserId2 };
}

async function seedContent(ids: { adminProfileId: string; clientProfileId1: string; clientProfileId2: string; adminUserId: string; clientUserId1: string; clientUserId2: string }) {
  // Comments: only if table exists
  if (await tableExists('comments')) {
    await db.insert(comments).values([
      { id: uuid(), content: 'Welcome to the platform!', userId: ids.adminProfileId, itemId: 'item-1' },
      { id: uuid(), content: 'Great product!', userId: ids.clientProfileId1, itemId: 'item-2', rating: 5 },
      { id: uuid(), content: 'Trying it out.', userId: ids.clientProfileId2, itemId: 'item-3', rating: 4 }
    ]);
  }

  // Activity Logs: try users first; if FK expects client_profiles, fallback
  if (await tableExists('activityLogs')) {
    try {
      await db.insert(activityLogs).values([
        { userId: ids.adminUserId, action: 'SIGN_IN' },
        { userId: ids.clientUserId1, action: 'SIGN_UP' },
        { userId: ids.clientUserId2, action: 'SIGN_IN' }
      ]);
    } catch {
      await db.insert(activityLogs).values([
        { userId: ids.adminProfileId, action: 'SIGN_IN' },
        { userId: ids.clientProfileId1, action: 'SIGN_UP' },
        { userId: ids.clientProfileId2, action: 'SIGN_IN' }
      ]);
    }
  }

  // Favorites: only if table exists
  if (await tableExists('favorites')) {
    await db.insert(favorites).values([
      { id: uuid(), userId: ids.clientUserId1, itemSlug: 'alpha', itemName: 'Alpha' },
      { id: uuid(), userId: ids.clientUserId2, itemSlug: 'beta', itemName: 'Beta' }
    ]);
  }
}

/**
 * Main seed function - exported for reuse by auto-initialization
 * Wipes existing data and seeds the database with test data
 */
export async function runSeed(): Promise<void> {
  await ensureDb();
  console.log('Seeding database: wiping existing data...');
  await wipeData();

  console.log('Seeding roles and permissions...');
  const { roleAdminId, roleClientId } = await seedCoreRBAC();

  console.log('Seeding users, accounts, and client profiles...');
  const profileIds = await seedUsersAndProfiles(roleAdminId, roleClientId);

  console.log('Seeding comments, activity logs, and favorites...');
  await seedContent(profileIds);

  // Basic verification counts (skip if tables don't exist yet)
  try {
    const [{ count: usersCount }] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [{ count: profilesCount }] = await db.select({ count: sql<number>`count(*)` }).from(clientProfiles);
    const [{ count: rolesCount }] = await db.select({ count: sql<number>`count(*)` }).from(roles);
    const [{ count: permsCount }] = await db.select({ count: sql<number>`count(*)` }).from(permissions);

    console.log('Seed complete:', { users: usersCount, profiles: profilesCount, roles: rolesCount, permissions: permsCount });
  } catch {
    // Tables may not exist yet (schema not migrated) - skip verification but seeding succeeded
    console.log('Seed complete (verification skipped - tables may not exist yet)');
  }

  // Mark seed as completed in seed_status table
  try {
    await db
      .update(seedStatus)
      .set({
        status: 'completed',
        completedAt: new Date()
      })
      .where(eq(seedStatus.id, 'singleton'));

    console.log('Seed status marked as completed');
  } catch (statusError) {
    // If seed_status table doesn't exist, log warning but don't fail
    // This can happen if migration hasn't run yet
    console.warn('Could not update seed status (table may not exist):', statusError instanceof Error ? statusError.message : statusError);
  }
}
