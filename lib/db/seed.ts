import bcrypt from 'bcryptjs';
import { seed } from 'drizzle-seed';
import { sql, eq } from 'drizzle-orm';

// Import schema tables
import {
	users,
	accounts,
	clientProfiles,
	roles,
	permissions,
	rolePermissions,
	userRoles
} from './schema';
import { getAllPermissions } from '../permissions/definitions';
import * as schema from './schema';

// Global database connection - will be initialized after environment loading
let db: ReturnType<typeof import('./drizzle').getDrizzleInstance>;

async function ensureDb() {
	// Quick sanity check similar to drizzle.ts behavior
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not set. Aborting seed to prevent accidental DummyDb operations.');
	}

	// Initialize database connection - use getDrizzleInstance() to get real instance, not Proxy
	const { getDrizzleInstance } = await import('./drizzle');
	db = getDrizzleInstance();
}

async function tableExists(name: string): Promise<boolean> {
	const res = await db.execute(
		sql`SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND lower(table_name) = lower(${name})
        LIMIT 1`
	);
	// postgres-js returns { rows: [...] }
	const rows = (res as { rows?: unknown[] }).rows ?? (Array.isArray(res) ? res : []);
	return rows.length > 0;
}

/**
 * Check if a table is empty
 */
async function isTableEmpty(tableName: string, table: unknown): Promise<boolean> {
	const exists = await tableExists(tableName);
	if (!exists) return true; // Table doesn't exist = treat as empty

	const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(table as never);
	return count === 0;
}

/**
 * Main seed function - exported for reuse by auto-initialization
 * Seeds database using drizzle-seed with per-table idempotency checks
 * Safe to run multiple times - only seeds tables that are empty
 *
 * NOTE: This function ONLY seeds data. Status management is handled by the caller (initialize.ts)
 */
export async function runSeed(): Promise<void> {
	await ensureDb();

	console.log('[Seed] Checking existing data...');

	try {
		// Check each essential table individually
		const permissionsEmpty = await isTableEmpty('permissions', permissions);
		const rolesEmpty = await isTableEmpty('roles', roles);
		const usersEmpty = await isTableEmpty('users', users);
		const accountsEmpty = await isTableEmpty('accounts', accounts);
		const profilesEmpty = await isTableEmpty('client_profiles', clientProfiles);

		// Log what will be seeded
		const tablesToSeed: string[] = [];
		if (permissionsEmpty) tablesToSeed.push('permissions');
		if (rolesEmpty) tablesToSeed.push('roles');
		if (usersEmpty) tablesToSeed.push('users');
		if (accountsEmpty) tablesToSeed.push('accounts');
		if (profilesEmpty) tablesToSeed.push('clientProfiles');

		if (tablesToSeed.length === 0) {
			console.log('[Seed] All tables have data - skipping seed');
			return;
		}

		console.log(`[Seed] Will seed: ${tablesToSeed.join(', ')}`);

		// Read environment variables outside seed()
		const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
		const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Passw0rd123!';
		const hashedPassword = await bcrypt.hash(adminPassword, 10);

		// Get all permissions
		const allPermissions = getAllPermissions();

		// Generate role IDs manually (roles table doesn't have $defaultFn)
		const roleAdminId = crypto.randomUUID();
		const roleClientId = crypto.randomUUID();

		// Build seed config conditionally based on which tables are empty
		const seedConfig: Record<string, unknown> = {};

		if (permissionsEmpty) {
			seedConfig.permissions = {
				count: allPermissions.length,
				columns: {
					key: ({ index }: { index: number }) => allPermissions[index],
					description: ({ index }: { index: number }) =>
						allPermissions[index]
							.replace(':', ' ')
							.replace(/([a-z])([A-Z])/g, '$1 $2')
							.toLowerCase()
				}
			};
		}

		if (rolesEmpty) {
			seedConfig.roles = {
				count: 2,
				columns: {
					id: ({ index }: { index: number }) => (index === 0 ? roleAdminId : roleClientId),
					name: ({ index }: { index: number }) => (index === 0 ? 'admin' : 'client'),
					description: ({ index }: { index: number }) => (index === 0 ? 'Administrator' : 'Client user'),
					isAdmin: ({ index }: { index: number }) => index === 0
				}
			};
		}

		if (usersEmpty) {
			seedConfig.users = {
				count: 3,
				columns: {
					email: ({ index }: { index: number }) => {
						if (index === 0) return adminEmail;
						if (index === 1) return 'client1@example.com';
						return 'client2@example.com';
					},
					passwordHash: ({ index }: { index: number }) => {
						if (index < 2) return hashedPassword;
						return null;
					}
				}
			};
		}

		if (accountsEmpty) {
			seedConfig.accounts = {
				count: 3,
				with: {
					users: {
						columns: {
							userId: 'id'
						}
					}
				},
				columns: {
					type: ({ index }: { index: number }) => (index === 2 ? 'oauth' : 'email'),
					provider: ({ index }: { index: number }) => (index === 2 ? 'google' : 'credentials'),
					providerAccountId: ({ index }: { index: number }) => {
						if (index === 0) return adminEmail;
						if (index === 1) return 'client1@example.com';
						return 'google-oauth-123';
					},
					email: ({ index }: { index: number }) => {
						if (index === 0) return adminEmail;
						if (index === 1) return 'client1@example.com';
						return null;
					},
					passwordHash: ({ index }: { index: number }) => {
						if (index < 2) return hashedPassword;
						return null;
					}
				}
			};
		}

		if (profilesEmpty) {
			seedConfig.clientProfiles = {
				count: 3,
				with: {
					users: {
						columns: {
							userId: 'id'
						}
					}
				},
				columns: {
					email: ({ index }: { index: number }) => {
						if (index === 0) return adminEmail;
						if (index === 1) return 'client1@example.com';
						return 'client2@example.com';
					},
					name: ({ index }: { index: number }) => {
						if (index === 0) return 'Admin User';
						if (index === 1) return 'Client One';
						return 'Client Two';
					}
				}
			};
		}

		// Only call seed if there's something to seed
		if (Object.keys(seedConfig).length > 0) {
			await seed(db, schema as never, seedConfig);
			console.log(`[Seed] Completed seeding ${Object.keys(seedConfig).length} tables`);
		}

		// Seed junction tables separately (role_permissions, user_roles)
		// These need to be queried after seed() completes

		// Check if tables exist before seeding junction tables
		const hasRolePermissions = await tableExists('role_permissions');
		const hasUserRoles = await tableExists('user_roles');

		if (hasRolePermissions) {
		console.log('[Seed] Seeding role-permissions...');

		// Get admin role and all permissions
		const adminRoles = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
		const allPerms = await db.select().from(permissions);

		if (adminRoles.length > 0) {
		const adminRolePermissions = allPerms.map((perm) => ({
			roleId: adminRoles[0].id,
			permissionId: perm.id
		}));

		try {
			await db.insert(rolePermissions).values(adminRolePermissions).onConflictDoNothing();
			console.log(`[Seed] Assigned ${allPerms.length} permissions to admin role`);
		} catch (rpError) {
			// Ignore duplicate errors
			if (rpError && typeof rpError === 'object' && 'code' in rpError && rpError.code === '23505') {
				console.log('[Seed] Role-permissions already exist - skipping');
			} else {
				console.warn('[Seed] Error seeding role-permissions:', rpError);
			}
		}
		}
		}

		if (hasUserRoles) {
		console.log('[Seed] Seeding user-roles...');

		// Get all users and roles
		const allUsers = await db.select().from(users).limit(3);
		const adminRoles = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
		const clientRoles = await db.select().from(roles).where(eq(roles.name, 'client')).limit(1);

		if (allUsers.length === 3 && adminRoles.length > 0 && clientRoles.length > 0) {
		try {
			await db
				.insert(userRoles)
				.values([
					{ userId: allUsers[0].id, roleId: adminRoles[0].id }, // Admin user → admin role
					{ userId: allUsers[1].id, roleId: clientRoles[0].id }, // Client1 → client role
					{ userId: allUsers[2].id, roleId: clientRoles[0].id } // Client2 → client role
				])
				.onConflictDoNothing();

			console.log('[Seed] Assigned roles to users');
		} catch (urError) {
			// Ignore duplicate errors
			if (urError && typeof urError === 'object' && 'code' in urError && urError.code === '23505') {
				console.log('[Seed] User-roles already exist - skipping');
			} else {
				console.warn('[Seed] Error seeding user-roles:', urError);
			}
		}
		}
		}

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
	} catch (seedError) {
		// Re-throw the error - caller (initialize.ts) will handle status management
		throw seedError;
	}
}
