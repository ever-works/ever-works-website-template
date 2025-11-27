import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

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

  // Initialize database connection
  const { db: dbConnection } = await import('./drizzle');
  db = dbConnection;
}

/**
 * Generate deterministic UUID based on a string key
 * This ensures the same key always generates the same UUID
 */
function deterministicUuid(key: string): string {
  const hash = createHash('sha256').update(key).digest('hex');
  // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16), // Version 4
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20),
    hash.slice(20, 32)
  ].join('-');
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

  // Create permission records with deterministic UUIDs (based on key)
  const permissionRecords = allPermissions.map(permission => ({
    id: deterministicUuid(`permission:${permission}`),
    key: permission,
    description: permission.replace(':', ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  }));

  // UPSERT permissions (update if exists, insert if not)
  await db.insert(permissions)
    .values(permissionRecords)
    .onConflictDoUpdate({
      target: permissions.key,
      set: {
        description: sql`excluded.description`
      }
    });

  // Roles with deterministic UUIDs (based on name)
  const roleAdminId = deterministicUuid('role:admin');
  const roleClientId = deterministicUuid('role:client');

  // UPSERT roles
  await db.insert(roles)
    .values([
      { id: roleAdminId, name: 'admin', description: 'Administrator', isAdmin: true },
      { id: roleClientId, name: 'client', description: 'Client user', isAdmin: false }
    ])
    .onConflictDoUpdate({
      target: roles.name,
      set: {
        description: sql`excluded.description`,
        isAdmin: sql`excluded."is_admin"`
      }
    });

  // Role-Permissions: Give admin role ALL permissions
  if (hasRolePermissions) {
    const adminRolePermissions = permissionRecords.map(perm => ({
      roleId: roleAdminId,
      permissionId: perm.id
    }));

    // UPSERT role-permissions (composite key)
    await db.insert(rolePermissions)
      .values(adminRolePermissions)
      .onConflictDoNothing(); // Skip if relationship already exists
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

  // SECURITY: Production environment guard
  const isProduction = process.env.NODE_ENV === 'production';

  // Get credentials from environment or use defaults (development only)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const defaultPassword = 'Passw0rd123!';

  // SECURITY CHECK: Refuse to use default password in production
  if (isProduction && !adminPassword) {
    console.error('[Seed] ERROR: Cannot seed users in production without SEED_ADMIN_PASSWORD');
    console.error('[Seed] Set SEED_ADMIN_PASSWORD environment variable or disable seeding');
    throw new Error('SEED_ADMIN_PASSWORD required in production environment');
  }

  // SECURITY WARNING: Alert if using default credentials
  if (!isProduction && !adminPassword) {
    console.warn('[Seed] ⚠️  WARNING: Using default development credentials');
    console.warn('[Seed] ⚠️  Email: admin@example.com, Password: Passw0rd123!');
    console.warn('[Seed] ⚠️  DO NOT use these credentials in production!');
  }

  // Use environment password in production, default in development
  const passwordToHash = adminPassword || defaultPassword;

  // Deterministic user IDs (based on email)
  const adminUserId = deterministicUuid(`user:${adminEmail}`);
  const clientUserId1 = deterministicUuid('user:client1@example.com');
  const clientUserId2 = deterministicUuid('user:client2@example.com');

  // Hash password
  const hashed = await bcrypt.hash(passwordToHash, 10);

  // UPSERT users
  await db.insert(users)
    .values([
      {
        id: adminUserId,
        email: adminEmail,
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
    ])
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: sql`excluded."password_hash"`
      }
    });

  // Accounts (credentials for admin and client1; oauth for client2)
  if (hasAccounts) {
    // UPSERT accounts (composite key: userId + provider + providerAccountId)
    await db.insert(accounts)
      .values([
        { userId: adminUserId, type: 'email', provider: 'credentials', providerAccountId: adminEmail, email: adminEmail, passwordHash: hashed },
        { userId: clientUserId1, type: 'email', provider: 'credentials', providerAccountId: 'client1@example.com', email: 'client1@example.com', passwordHash: hashed },
        { userId: clientUserId2, type: 'oauth', provider: 'google', providerAccountId: 'google-oauth-123' }
      ])
      .onConflictDoUpdate({
        target: [accounts.provider, accounts.providerAccountId],
        set: {
          userId: sql`excluded."userId"`,
          type: sql`excluded.type`,
          email: sql`excluded.email`,
          passwordHash: sql`excluded."password_hash"`
        }
      });
  }

  // Client Profiles with deterministic IDs (based on email)
  const adminProfileId = deterministicUuid(`profile:${adminEmail}`);
  const clientProfileId1 = deterministicUuid('profile:client1@example.com');
  const clientProfileId2 = deterministicUuid('profile:client2@example.com');

  if (hasClientProfiles) {
    // UPSERT client profiles using raw SQL with ON CONFLICT
    await db.execute(sql`
      INSERT INTO client_profiles (id, "userId", email, name)
      VALUES
        (${adminProfileId}, ${adminUserId}, ${adminEmail}, 'Admin User'),
        (${clientProfileId1}, ${clientUserId1}, 'client1@example.com', 'Client One'),
        (${clientProfileId2}, ${clientUserId2}, 'client2@example.com', 'Client Two')
      ON CONFLICT ("userId")
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name
    `);
  }

  // User Roles
  if (hasUserRoles && roleAdminId && roleClientId) {
    // UPSERT user roles (composite key)
    await db.insert(userRoles)
      .values([
        { userId: adminUserId, roleId: roleAdminId },
        { userId: clientUserId1, roleId: roleClientId },
        { userId: clientUserId2, roleId: roleClientId }
      ])
      .onConflictDoNothing(); // Skip if relationship already exists
  }

  return { adminProfileId, clientProfileId1, clientProfileId2, adminUserId, clientUserId1, clientUserId2 };
}

async function seedContent(ids: { adminProfileId: string; clientProfileId1: string; clientProfileId2: string; adminUserId: string; clientUserId1: string; clientUserId2: string }) {
  // Comments: only if table exists
  if (await tableExists('comments')) {
    // UPSERT comments with deterministic IDs
    await db.insert(comments)
      .values([
        { id: deterministicUuid('comment:admin:item-1'), content: 'Welcome to the platform!', userId: ids.adminProfileId, itemId: 'item-1' },
        { id: deterministicUuid('comment:client1:item-2'), content: 'Great product!', userId: ids.clientProfileId1, itemId: 'item-2', rating: 5 },
        { id: deterministicUuid('comment:client2:item-3'), content: 'Trying it out.', userId: ids.clientProfileId2, itemId: 'item-3', rating: 4 }
      ])
      .onConflictDoUpdate({
        target: comments.id,
        set: {
          content: sql`excluded.content`,
          rating: sql`excluded.rating`
        }
      });
  }

  // Activity Logs: try users first; if FK expects client_profiles, fallback
  if (await tableExists('activityLogs')) {
    try {
      // UPSERT activity logs (skip duplicates)
      await db.insert(activityLogs)
        .values([
          { userId: ids.adminUserId, action: 'SIGN_IN' },
          { userId: ids.clientUserId1, action: 'SIGN_UP' },
          { userId: ids.clientUserId2, action: 'SIGN_IN' }
        ])
        .onConflictDoNothing(); // Skip if already exists
    } catch {
      // Fallback to client profiles if users FK doesn't work
      await db.insert(activityLogs)
        .values([
          { userId: ids.adminProfileId, action: 'SIGN_IN' },
          { userId: ids.clientProfileId1, action: 'SIGN_UP' },
          { userId: ids.clientProfileId2, action: 'SIGN_IN' }
        ])
        .onConflictDoNothing(); // Skip if already exists
    }
  }

  // Favorites: only if table exists
  if (await tableExists('favorites')) {
    // UPSERT favorites with deterministic IDs
    await db.insert(favorites)
      .values([
        { id: deterministicUuid('favorite:client1:alpha'), userId: ids.clientUserId1, itemSlug: 'alpha', itemName: 'Alpha' },
        { id: deterministicUuid('favorite:client2:beta'), userId: ids.clientUserId2, itemSlug: 'beta', itemName: 'Beta' }
      ])
      .onConflictDoUpdate({
        target: [favorites.userId, favorites.itemSlug],
        set: {
          itemName: sql`excluded."item_name"`
        }
      });
  }
}

/**
 * Main seed function - exported for reuse by auto-initialization
 * Idempotently seeds the database with test data using UPSERT operations
 * Safe to run multiple times - will update existing records or insert new ones
 *
 * @param options.manageStatus - If true, manages seed_status table (upsert at start, update on completion/failure)
 *                                If false, assumes caller manages status (e.g., initializeDatabase with lock)
 *                                Default: true
 */
export async function runSeed(options: { manageStatus?: boolean } = {}): Promise<void> {
  const { manageStatus = true } = options;

  await ensureDb();

  // If managing status, upsert seed_status record at start
  if (manageStatus) {
    try {
      const existingStatus = await db
        .select()
        .from(seedStatus)
        .where(eq(seedStatus.id, 'singleton'))
        .limit(1);

      // Save old status BEFORE updating (for wipe decision)
      const oldStatus = existingStatus.length > 0 ? existingStatus[0].status : null;

      if (existingStatus.length > 0) {
        // Update existing record to 'seeding'
        await db
          .update(seedStatus)
          .set({
            status: 'seeding',
            startedAt: new Date(),
            completedAt: null,
            error: null
          })
          .where(eq(seedStatus.id, 'singleton'));

        console.log('[Seed] Updated seed_status to "seeding"');
      } else {
        // Insert new record
        await db.insert(seedStatus).values({
          id: 'singleton',
          status: 'seeding',
          startedAt: new Date()
        });

        console.log('[Seed] Created seed_status record with status "seeding"');
      }

      // Log previous status for debugging
      if (oldStatus) {
        console.log(`[Seed] Previous seed status: ${oldStatus}`);
      }
    } catch (statusError) {
      // If seed_status table doesn't exist, log warning and continue
      console.warn('[Seed] Could not manage seed_status (table may not exist):', statusError instanceof Error ? statusError.message : statusError);
    }
  }

  try {
    console.log('Seeding database (using idempotent UPSERT operations)...');
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
    if (manageStatus) {
      try {
        await db
          .update(seedStatus)
          .set({
            status: 'completed',
            completedAt: new Date()
          })
          .where(eq(seedStatus.id, 'singleton'));

        console.log('[Seed] Seed status marked as completed');
      } catch (statusError) {
        // If seed_status table doesn't exist, log warning but don't fail
        console.warn('[Seed] Could not update seed status (table may not exist):', statusError instanceof Error ? statusError.message : statusError);
      }
    }
  } catch (seedError) {
    // If managing status, mark seed as failed
    if (manageStatus) {
      try {
        await db
          .update(seedStatus)
          .set({
            status: 'failed',
            error: seedError instanceof Error ? seedError.message : 'Unknown error',
            completedAt: new Date()
          })
          .where(eq(seedStatus.id, 'singleton'));

        console.error('[Seed] Seed status marked as failed');
      } catch {
        // Ignore errors updating status - original error is more important
      }
    }

    // Re-throw the original error
    throw seedError;
  }
}
