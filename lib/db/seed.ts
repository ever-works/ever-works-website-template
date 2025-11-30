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
	userRoles,
	paymentProviders,
	paymentAccounts,
	subscriptions,
	subscriptionHistory
} from './schema';
import type { NewAccount, NewPaymentProvider, NewPaymentAccount } from './schema';
import { getAllPermissions } from '../permissions/definitions';
import { PaymentProvider, PaymentPlan } from '../constants';
import { SubscriptionStatus } from './schema';

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

	// Check if demo mode is enabled
	const isDemoMode = process.env.NEXT_PUBLIC_DEMO === 'true';

	if (isDemoMode) {
		console.log('[Seed] 🎭 Running in DEMO mode - will seed comprehensive test data');
	} else {
		console.log('[Seed] 🔒 Running in PRODUCTION mode - minimal essential seeding only');
	}

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
		let credentialsAutoGenerated = false;

		if (isProd) {
			if (!envAdminEmail || !envAdminPassword) {
				// Auto-generate secure credentials in production if not provided
				// Generate a secure random password (32 chars with mixed case, numbers, symbols)
				const generateSecurePassword = () => {
					const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
					const randomValues = new Uint8Array(32);
					crypto.getRandomValues(randomValues);
					return Array.from(randomValues, (v) => chars[v % chars.length]).join('');
				};
				
				adminEmail = envAdminEmail || `admin-${crypto.randomUUID().slice(0, 8)}@auto.generated`;
				adminPassword = envAdminPassword || generateSecurePassword();
				credentialsAutoGenerated = true;
				
				// Log the auto-generated credentials prominently
				console.log('');
				console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
				console.log('║  ⚠️  AUTO-GENERATED ADMIN CREDENTIALS (SAVE THESE NOW!)                      ║');
				console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
				console.log('║                                                                              ║');
				console.log(`║  Email:    ${adminEmail.padEnd(64)}║`);
				console.log(`║  Password: ${adminPassword.padEnd(64)}║`);
				console.log('║                                                                              ║');
				console.log('║  These credentials will only be shown ONCE.                                  ║');
				console.log('║  To set custom credentials, configure these environment variables:           ║');
				console.log('║    - SEED_ADMIN_EMAIL                                                        ║');
				console.log('║    - SEED_ADMIN_PASSWORD                                                     ║');
				console.log('║                                                                              ║');
				console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
				console.log('');
			} else {
				adminEmail = envAdminEmail;
				adminPassword = envAdminPassword;
				
				// Warn if using the insecure default password in production
				if (envAdminPassword === 'Passw0rd123!') {
					console.warn('');
					console.warn('⚠️  WARNING: Using insecure default password in production!');
					console.warn('   Please set SEED_ADMIN_PASSWORD to a strong, unique password.');
					console.warn('');
				}
			}
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

			// Look up the seeded client users by their known emails to avoid relying on implicit ordering
			const allUsersForProfiles = await db.select().from(users);
			const client1User = allUsersForProfiles.find((u) => u.email === 'client1@example.com');
			const client2User = allUsersForProfiles.find((u) => u.email === 'client2@example.com');

			if (client1User && client2User) {
				const profileValues = [
					{
						userId: client1User.id,
						email: 'client1@example.com',
						name: 'Client One'
					},
					{
						userId: client2User.id,
						email: 'client2@example.com',
						name: 'Client Two'
					}
				];

				await db.insert(clientProfiles).values(profileValues).onConflictDoNothing();
				console.log(`[Seed] Created ${profileValues.length} client profiles (excluding admin)`);
			} else {
				console.warn('[Seed] Skipping clientProfiles seeding - expected seed client users not found');
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

		// ============================================
		// DEMO MODE: Seed additional tables
		// ============================================
		if (isDemoMode) {
			console.log('[Seed] 🎭 Demo mode: seeding additional tables...');

			// Import faker dynamically for demo mode
			const { faker } = await import('@faker-js/faker');

			// ============================================
			// Step 2: Payment/Subscription Tables
			// ============================================

			// Seed Payment Providers (Stripe & LemonSqueezy)
			const providersEmpty = await isTableEmpty('paymentProviders', paymentProviders);
			if (providersEmpty) {
				console.log('[Seed] 💳 Seeding payment providers...');

				const providerValues: NewPaymentProvider[] = [
					{
						name: PaymentProvider.STRIPE,
						isActive: true
					},
					{
						name: PaymentProvider.LEMONSQUEEZY,
						isActive: true
					}
				];

				await db.insert(paymentProviders).values(providerValues).onConflictDoNothing();
				console.log(`[Seed] ✓ Created ${providerValues.length} payment providers`);
			}

			// Get seeded providers
			const allProviders = await db.select().from(paymentProviders);
			const stripeProvider = allProviders.find((p) => p.name === PaymentProvider.STRIPE);
			const lemonSqueezyProvider = allProviders.find((p) => p.name === PaymentProvider.LEMONSQUEEZY);

			// Seed Payment Accounts (for users with paid plans)
			const paymentAccountsEmpty = await isTableEmpty('paymentAccounts', paymentAccounts);
			if (paymentAccountsEmpty && stripeProvider && lemonSqueezyProvider) {
				console.log('[Seed] 💳 Seeding payment accounts...');

				// Get all users for payment accounts
				const allUsersForPayment = await db.select().from(users);

				// Create payment accounts for 70% of users (mix of Stripe and LemonSqueezy)
				const usersWithPayment = allUsersForPayment.filter(() => faker.datatype.boolean(0.7));

				const paymentAccountValues: NewPaymentAccount[] = usersWithPayment.map((user) => {
					const useStripe = faker.datatype.boolean(0.7); // 70% Stripe, 30% LemonSqueezy
					const provider = useStripe ? stripeProvider : lemonSqueezyProvider;

					return {
						userId: user.id,
						providerId: provider.id,
						customerId: useStripe
							? `cus_${faker.string.alphanumeric(14).toUpperCase()}`
							: `cus_${faker.string.alphanumeric(32)}`,
						accountId: faker.datatype.boolean(0.5) ? faker.string.alphanumeric(16) : undefined,
						lastUsed: faker.datatype.boolean(0.8) ? faker.date.recent({ days: 30 }) : undefined
					};
				});

				await db.insert(paymentAccounts).values(paymentAccountValues).onConflictDoNothing();
				console.log(`[Seed] ✓ Created ${paymentAccountValues.length} payment accounts`);
			}

			// Seed Subscriptions
			const subscriptionsEmpty = await isTableEmpty('subscriptions', subscriptions);
			if (subscriptionsEmpty) {
				console.log('[Seed] 💳 Seeding subscriptions...');

				// Get all users for subscriptions
				const allUsersForSubscriptions = await db.select().from(users);

				// Create subscriptions for all users
				// Distribution: 60% free, 30% standard, 10% premium
				const subscriptionValues = allUsersForSubscriptions.map((user) => {
					const planRandom = faker.number.float({ min: 0, max: 1, precision: 0.01 });
					let plan: PaymentPlan;
					let status: string;
					let provider: string;

					if (planRandom < 0.6) {
						// 60% free plan
						plan = PaymentPlan.FREE;
						status = SubscriptionStatus.ACTIVE;
						provider = PaymentProvider.STRIPE; // Default provider for free
					} else if (planRandom < 0.9) {
						// 30% standard plan
						plan = PaymentPlan.STANDARD;
						// 80% active, 15% cancelled, 5% expired
						const statusRandom = faker.number.float({ min: 0, max: 1, precision: 0.01 });
						if (statusRandom < 0.8) status = SubscriptionStatus.ACTIVE;
						else if (statusRandom < 0.95) status = SubscriptionStatus.CANCELLED;
						else status = SubscriptionStatus.EXPIRED;
						provider = faker.datatype.boolean(0.7) ? PaymentProvider.STRIPE : PaymentProvider.LEMONSQUEEZY;
					} else {
						// 10% premium plan
						plan = PaymentPlan.PREMIUM;
						// 85% active, 10% cancelled, 5% paused
						const statusRandom = faker.number.float({ min: 0, max: 1, precision: 0.01 });
						if (statusRandom < 0.85) status = SubscriptionStatus.ACTIVE;
						else if (statusRandom < 0.95) status = SubscriptionStatus.CANCELLED;
						else status = SubscriptionStatus.PAUSED;
						provider = faker.datatype.boolean(0.7) ? PaymentProvider.STRIPE : PaymentProvider.LEMONSQUEEZY;
					}

					const startDate = faker.date.past({ years: 2 });
					const isActive = status === SubscriptionStatus.ACTIVE;

					return {
						userId: user.id,
						planId: plan,
						status,
						startDate,
						endDate: isActive ? undefined : faker.date.between({ from: startDate, to: new Date() }),
						paymentProvider: provider,
						subscriptionId: plan !== PaymentPlan.FREE
							? provider === PaymentProvider.STRIPE
								? `sub_${faker.string.alphanumeric(14).toUpperCase()}`
								: `sub_${faker.string.alphanumeric(32)}`
							: undefined,
						customerId: plan !== PaymentPlan.FREE
							? provider === PaymentProvider.STRIPE
								? `cus_${faker.string.alphanumeric(14).toUpperCase()}`
								: `cus_${faker.string.alphanumeric(32)}`
							: undefined,
						priceId: plan !== PaymentPlan.FREE
							? provider === PaymentProvider.STRIPE
								? `price_${faker.string.alphanumeric(14).toUpperCase()}`
								: `price_${faker.string.alphanumeric(32)}`
							: undefined,
						amountPaid: plan === PaymentPlan.FREE ? 0 : plan === PaymentPlan.STANDARD ? 1000 : 2000, // in cents
						currency: 'usd'
					};
				});

				const insertedSubscriptions = await db.insert(subscriptions).values(subscriptionValues).returning();
				console.log(`[Seed] ✓ Created ${insertedSubscriptions.length} subscriptions`);

				// Seed Subscription History
				const subscriptionHistoryEmpty = await isTableEmpty('subscriptionHistory', subscriptionHistory);
				if (subscriptionHistoryEmpty) {
					console.log('[Seed] 💳 Seeding subscription history...');

					// Create 1-3 history entries for each subscription
					const historyValues = insertedSubscriptions.flatMap((sub) => {
						const numEntries = faker.number.int({ min: 1, max: 3 });
						return Array.from({ length: numEntries }, (_, index) => ({
							subscriptionId: sub.id,
							action: index === 0 ? 'created' : faker.helpers.arrayElement(['upgraded', 'downgraded', 'renewed', 'cancelled', 'paused', 'resumed']),
							previousStatus: index === 0 ? undefined : faker.helpers.arrayElement([SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING]),
							newStatus: index === numEntries - 1 ? sub.status : faker.helpers.arrayElement([SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED]),
							previousPlan: index === 0 ? undefined : faker.helpers.arrayElement([PaymentPlan.FREE, PaymentPlan.STANDARD]),
							newPlan: sub.planId,
							reason: faker.helpers.arrayElement([undefined, 'User requested', 'Payment failed', 'Trial ended', 'Upgrade']),
							metadata: faker.datatype.boolean(0.3) ? JSON.stringify({ source: faker.helpers.arrayElement(['web', 'mobile', 'api']) }) : undefined,
							createdAt: faker.date.between({ from: sub.startDate, to: new Date() })
						}));
					});

					await db.insert(subscriptionHistory).values(historyValues).onConflictDoNothing();
					console.log(`[Seed] ✓ Created ${historyValues.length} subscription history entries`);
				}
			}

			// TODO: Step 3 - Activity/Engagement tables will be added here
			// TODO: Step 4 - Auth/Session tables will be added here
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

		// Get specific seeded users and roles to avoid relying on implicit ordering
		const allUsersForRoles = await db.select().from(users);
		const adminUserForRoles = allUsersForRoles.find((u) => u.email === adminEmail);
		const client1UserForRoles = allUsersForRoles.find((u) => u.email === 'client1@example.com');
		const client2UserForRoles = allUsersForRoles.find((u) => u.email === 'client2@example.com');

		const adminRoles = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
		const clientRoles = await db.select().from(roles).where(eq(roles.name, 'client')).limit(1);

		if (adminUserForRoles && client1UserForRoles && client2UserForRoles && adminRoles.length > 0 && clientRoles.length > 0) {
		try {
			await db
				.insert(userRoles)
				.values([
					{ userId: adminUserForRoles.id, roleId: adminRoles[0].id }, // Admin user → admin role
					{ userId: client1UserForRoles.id, roleId: clientRoles[0].id }, // Client1 → client role
					{ userId: client2UserForRoles.id, roleId: clientRoles[0].id } // Client2 → client role
				])
				.onConflictDoNothing();

			console.log('[Seed] Assigned roles to seeded users');
		} catch (urError) {
			// Ignore duplicate errors
			if (urError && typeof urError === 'object' && 'code' in urError && urError.code === '23505') {
				console.log('[Seed] User-roles already exist - skipping');
			} else {
				console.warn('[Seed] Error seeding user-roles:', urError);
			}
		}
		} else {
			console.warn('[Seed] Skipping user-roles seeding - expected seed users or roles not found');
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
