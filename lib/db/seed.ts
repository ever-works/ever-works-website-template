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
	comments,
	activityLogs,
	favorites,
	seedStatus
} from './schema';
import { getAllPermissions } from '../permissions/definitions';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from './schema';

// Global database connection - will be initialized after environment loading
let db: NodePgDatabase<typeof schema>;

async function ensureDb() {
	// Quick sanity check similar to drizzle.ts behavior
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not set. Aborting seed to prevent accidental DummyDb operations.');
	}

	// Initialize database connection
	const { db: dbConnection } = await import('./drizzle');
	db = dbConnection;
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
 * Main seed function - exported for reuse by auto-initialization
 * Seeds database using drizzle-seed with try-catch for idempotency
 * Safe to run multiple times - duplicate key errors are caught and ignored
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
		} catch (statusError) {
			// If seed_status table doesn't exist, log warning and continue
			console.warn(
				'[Seed] Could not manage seed_status (table may not exist):',
				statusError instanceof Error ? statusError.message : statusError
			);
		}
	}

	try {
		console.log('Seeding database with drizzle-seed...');

		// Read environment variables outside seed()
		const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
		const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Passw0rd123!';
		const hashedPassword = await bcrypt.hash(adminPassword, 10);

		// Get all permissions
		const allPermissions = getAllPermissions();

		// Generate role IDs manually (roles table doesn't have $defaultFn)
		const roleAdminId = crypto.randomUUID();
		const roleClientId = crypto.randomUUID();

		// Wrap seed in try-catch for idempotency (ignore duplicate key errors)
		try {
			await seed(db, schema as never, {
				permissions: {
					count: allPermissions.length,
					columns: {
						key: ({ index }) => allPermissions[index],
						description: ({ index }) =>
							allPermissions[index]
								.replace(':', ' ')
								.replace(/([a-z])([A-Z])/g, '$1 $2')
								.toLowerCase()
					}
				},

				roles: {
					count: 2,
					columns: {
						id: ({ index }) => (index === 0 ? roleAdminId : roleClientId),
						name: ({ index }) => (index === 0 ? 'admin' : 'client'),
						description: ({ index }) => (index === 0 ? 'Administrator' : 'Client user'),
						isAdmin: ({ index }) => index === 0
					}
				},

				users: {
					count: 3,
					columns: {
						email: ({ index }) => {
							if (index === 0) return adminEmail;
							if (index === 1) return 'client1@example.com';
							return 'client2@example.com';
						},
						passwordHash: ({ index }) => {
							if (index < 2) return hashedPassword;
							return null;
						}
					}
				},

				accounts: {
					count: 3,
					with: {
						users: {
							columns: {
								userId: 'id'
							}
						}
					},
					columns: {
						type: ({ index }) => (index === 2 ? 'oauth' : 'email'),
						provider: ({ index }) => (index === 2 ? 'google' : 'credentials'),
						providerAccountId: ({ index }) => {
							if (index === 0) return adminEmail;
							if (index === 1) return 'client1@example.com';
							return 'google-oauth-123';
						},
						email: ({ index }) => {
							if (index === 0) return adminEmail;
							if (index === 1) return 'client1@example.com';
							return null;
						},
						passwordHash: ({ index }) => {
							if (index < 2) return hashedPassword;
							return null;
						}
					}
				},

				clientProfiles: {
					count: 3,
					with: {
						users: {
							columns: {
								userId: 'id'
							}
						}
					},
					columns: {
						email: ({ index }) => {
							if (index === 0) return adminEmail;
							if (index === 1) return 'client1@example.com';
							return 'client2@example.com';
						},
						name: ({ index }) => {
							if (index === 0) return 'Admin User';
							if (index === 1) return 'Client One';
							return 'Client Two';
						}
					}
				},

				comments: {
					count: 3,
					with: {
						clientProfiles: {
							columns: {
								userId: 'id'
							}
						}
					},
					columns: {
						itemId: ({ index }) => `item-${index + 1}`,
						content: ({ index }) => {
							if (index === 0) return 'Welcome to the platform!';
							if (index === 1) return 'Great product!';
							return 'Trying it out.';
						},
						rating: ({ index }) => {
							if (index === 0) return null;
							if (index === 1) return 5;
							return 4;
						}
					}
				},

				activityLogs: {
					count: 3,
					with: {
						users: {
							columns: {
								userId: 'id'
							}
						}
					},
					columns: {
						action: ({ index }) => {
							if (index === 0) return 'SIGN_IN';
							if (index === 1) return 'SIGN_UP';
							return 'SIGN_IN';
						}
					}
				},

				favorites: {
					count: 2,
					with: {
						users: {
							columns: {
								userId: 'id'
							}
						}
					},
					columns: {
						itemSlug: ({ index }) => (index === 0 ? 'alpha' : 'beta'),
						itemName: ({ index }) => (index === 0 ? 'Alpha' : 'Beta')
					}
				}
			});

			console.log('[Seed] drizzle-seed completed successfully');
		} catch (seedError) {
			// Check if error is duplicate key violation (idempotency)
			if (seedError && typeof seedError === 'object' && 'code' in seedError && seedError.code === '23505') {
				console.log('[Seed] Data already exists - skipping (idempotent)');
			} else {
				throw seedError;
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
				console.warn(
					'[Seed] Could not update seed status (table may not exist):',
					statusError instanceof Error ? statusError.message : statusError
				);
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
