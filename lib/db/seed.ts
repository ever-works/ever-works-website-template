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
import type { NewAccount } from './schema';
import { getAllPermissions } from '../permissions/definitions';

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
	return Number(count) === 0;
}

/**
 * Get table row count
 */
async function getTableCount(tableName: string, table: unknown): Promise<number> {
	const exists = await tableExists(tableName);
	if (!exists) return 0;

	const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(table as never);
	return Number(count);
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

		// Debug logging - show actual data in each table
		if (process.env.NODE_ENV === 'development') {
			console.log('[Seed] Table status:');

			const permissionsData = await db.select().from(permissions);
			console.log(`  permissions: ${permissionsData.length} rows`, permissionsData.length <= 5 ? permissionsData : `[showing first 5]`, permissionsData.slice(0, 5));

			const rolesData = await db.select().from(roles);
			console.log(`  roles: ${rolesData.length} rows`, rolesData);

			const usersData = await db.select().from(users);
			console.log(`  users: ${usersData.length} rows`, usersData);

			const accountsData = await db.select().from(accounts);
			console.log(`  accounts: ${accountsData.length} rows`, accountsData.length <= 5 ? accountsData : `[showing first 5]`, accountsData.slice(0, 5));

			const profilesData = await db.select().from(clientProfiles);
			console.log(`  clientProfiles: ${profilesData.length} rows`, profilesData);
		}

		// Log what will be seeded (names only, for debug output)
		const tablesToSeedNames: string[] = [];
		if (permissionsEmpty) tablesToSeedNames.push('permissions');
		if (rolesEmpty) tablesToSeedNames.push('roles');
		if (usersEmpty) tablesToSeedNames.push('users');
		if (accountsEmpty) tablesToSeedNames.push('accounts');
		if (profilesEmpty) tablesToSeedNames.push('clientProfiles');

		if (tablesToSeedNames.length === 0) {
			console.log('[Seed] All tables have data - skipping seed');
			return;
		}

		console.log(`[Seed] Will seed: ${tablesToSeedNames.join(', ')}`);

		// Resolve admin credentials with environment-sensitive defaults
		const isProd = process.env.NODE_ENV === 'production';

		const envAdminEmail = process.env.SEED_ADMIN_EMAIL;
		const envAdminPassword = process.env.SEED_ADMIN_PASSWORD;

		let adminEmail: string;
		let adminPassword: string;

		if (isProd) {
			if (!envAdminEmail || !envAdminPassword) {
				throw new Error(
					'[Seed] SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in production. Refusing to seed admin user with implicit defaults.'
				);
			}

			if (envAdminPassword === 'Passw0rd123!') {
				throw new Error(
					'[Seed] Insecure SEED_ADMIN_PASSWORD detected in production. Use a strong, unique password instead of the default.'
				);
			}

			adminEmail = envAdminEmail;
			adminPassword = envAdminPassword;
		} else {
			// In non-production, allow safe defaults for developer convenience
			adminEmail = envAdminEmail || 'admin@demo.ever.works';
			adminPassword = envAdminPassword || 'Passw0rd123!';
		}

		const hashedPassword = await bcrypt.hash(adminPassword, 10);

		// Get all permissions
		const allPermissions = getAllPermissions();

		// Generate role IDs manually (roles table doesn't have $defaultFn)
		const roleAdminId = crypto.randomUUID();
		const roleClientId = crypto.randomUUID();

		// Build schema object for drizzle-seed based on which tables are empty
		// NOTE: we intentionally exclude `accounts` here and seed it manually below to
		// avoid drizzle-seed `with` relation constraints.
		const schemaToSeed: {
			permissions?: typeof permissions;
			roles?: typeof roles;
			users?: typeof users;
		} = {};
		if (permissionsEmpty) schemaToSeed.permissions = permissions;
		if (rolesEmpty) schemaToSeed.roles = roles;
		if (usersEmpty) schemaToSeed.users = users;

		// NOTE: clientProfiles is seeded manually AFTER seed() to respect 1:1 unique constraint
		// Do NOT add clientProfiles to schemaToSeed - it causes duplicate key errors

		// Only call seed if there's something to seed
		if (Object.keys(schemaToSeed).length > 0) {
			// Use drizzle-seed refine API to provide PREDEFINED data via generator functions
			// Base options { count: 1 } just return a SeedPromise; real counts are per-table below
			await seed(db, schemaToSeed, { count: 1 }).refine((funcs) => ({
				// Permissions: 1 row per permission key from definitions
				...(permissionsEmpty && {
					permissions: {
						count: allPermissions.length,
						columns: {
							key: funcs.valuesFromArray({
								values: allPermissions,
								isUnique: true
							}),
							description: funcs.valuesFromArray({
								values: allPermissions.map((p) =>
									p
										.replace(':', ' ')
										.replace(/([a-z])([A-Z])/g, '$1 $2')
										.toLowerCase()
								),
								isUnique: true
							})
						}
					}
				}),

				// Roles: admin + client with fixed IDs/names
				...(rolesEmpty && {
					roles: {
						count: 2,
						columns: {
							id: funcs.valuesFromArray({
								values: [roleAdminId, roleClientId],
								isUnique: true
							}),
							name: funcs.valuesFromArray({
								values: ['admin', 'client'],
								isUnique: true
							}),
							description: funcs.valuesFromArray({
								values: ['Administrator', 'Client user'],
								isUnique: true
							}),
							isAdmin: funcs.valuesFromArray({
								values: [true, false]
							})
						}
					}
				}),

				// Users: 3 known emails, 2 with password
				...(usersEmpty && {
					users: {
						count: 3,
						columns: {
							email: funcs.valuesFromArray({
								values: [adminEmail, 'client1@example.com', 'client2@example.com'],
								isUnique: true
							}),
							passwordHash: funcs.valuesFromArray({
								values: [hashedPassword, hashedPassword, undefined]
							})
						}
					}
				}),

			}));

			console.log('[Seed] Completed seeding permissions, roles, users, and accounts with predefined data');
		}

		// Seed clientProfiles manually to ensure 1:1 mapping with users (unique constraint)
		// NOTE: we intentionally do NOT create a client_profile for the admin user
		// (adminEmail). Only client1 and client2 get profiles.
		if (profilesEmpty) {
			console.log('[Seed] Seeding clientProfiles manually...');

			// Get the users we just seeded
			const seededUsers = await db.select().from(users).limit(3);

			if (seededUsers.length > 0) {
				// Assume first user is admin, next two are clients (as per seed order)
				const profileValues = seededUsers.slice(1, 3).map((user, index) => ({
					userId: user.id,
					email: index === 0 ? 'client1@example.com' : 'client2@example.com',
					name: index === 0 ? 'Client One' : 'Client Two'
				}));

				await db.insert(clientProfiles).values(profileValues).onConflictDoNothing();
				console.log(`[Seed] Created ${profileValues.length} client profiles (excluding admin)`);
			}
		}

		// Seed accounts manually to avoid drizzle-seed relation constraints
		if (accountsEmpty) {
			console.log('[Seed] Seeding accounts manually...');

			// Fetch users by email to get stable IDs
			const allUsers = await db.select().from(users);
			const adminUser = allUsers.find((u) => u.email === adminEmail);
			const client1User = allUsers.find((u) => u.email === 'client1@example.com');
			const client2User = allUsers.find((u) => u.email === 'client2@example.com');

			if (adminUser && client1User && client2User) {
				const accountValues: NewAccount[] = [
					{
						userId: adminUser.id,
						type: 'email',
						provider: 'credentials',
						providerAccountId: adminEmail,
						email: adminEmail,
						passwordHash: hashedPassword
					},
					{
						userId: client1User.id,
						type: 'email',
						provider: 'credentials',
						providerAccountId: 'client1@example.com',
						email: 'client1@example.com',
						passwordHash: hashedPassword
					},
					{
						userId: client2User.id,
						type: 'oauth',
						provider: 'google',
						providerAccountId: 'google-oauth-123',
						email: null,
						passwordHash: null
					}
				];

				await db.insert(accounts).values(accountValues).onConflictDoNothing();
				console.log(`[Seed] Created ${accountValues.length} accounts`);
			} else {
				console.warn('[Seed] Skipping manual accounts seeding - expected seed users not found');
			}
		}

		// Optional: generate additional fake users, profiles, and accounts when users table is initially empty
		if (usersEmpty) {
			const fakeUserCountRaw = process.env.SEED_FAKE_USER_COUNT;
			const fakeUserCount =
				fakeUserCountRaw === undefined || fakeUserCountRaw === ''
					? 10
					: Number(fakeUserCountRaw);

			if (!Number.isNaN(fakeUserCount) && fakeUserCount > 0) {
				const { faker } = await import('@faker-js/faker');

				console.log(`[Seed] Generating ${fakeUserCount} fake users with faker...`);

				const fakeUsersData = Array.from({ length: fakeUserCount }, () => {
					const email = faker.internet.email({ provider: 'demo.ever.works' });
					return {
						email,
						passwordHash: hashedPassword
					};
				});

				const insertedFakeUsers = await db.insert(users).values(fakeUsersData).returning();

				const fakeProfiles = insertedFakeUsers.map((user) => ({
					userId: user.id,
					email: user.email as string,
					name: faker.person.fullName()
				}));

				await db.insert(clientProfiles).values(fakeProfiles).onConflictDoNothing();

				const fakeAccounts: NewAccount[] = insertedFakeUsers.map((user) => ({
					userId: user.id,
					type: 'email',
					provider: 'credentials',
					providerAccountId: user.email as string,
					email: user.email as string,
					passwordHash: hashedPassword
				}));

				await db.insert(accounts).values(fakeAccounts).onConflictDoNothing();

				console.log(`[Seed] Added ${insertedFakeUsers.length} fake users (with profiles & accounts)`);
			}
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

			console.log('Seed complete:', {
				users: Number(usersCount),
				profiles: Number(profilesCount),
				roles: Number(rolesCount),
				permissions: Number(permsCount)
			});
		} catch {
			// Tables may not exist yet (schema not migrated) - skip verification but seeding succeeded
			console.log('Seed complete (verification skipped - tables may not exist yet)');
		}
	} catch (seedError) {
		// Re-throw the error - caller (initialize.ts) will handle status management
		throw seedError;
	}
}
