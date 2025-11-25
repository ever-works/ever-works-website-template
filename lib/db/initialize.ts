import { sql } from 'drizzle-orm';
import { users, roles, permissions } from './schema';

/**
 * Check if database has been seeded by verifying critical tables have data
 * @returns Promise<boolean> - true if database appears to be seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
	try {
		const { db } = await import('./drizzle');

		// Check roles table
		const rolesResult = await db.select({ count: sql<number>`count(*)` }).from(roles);
		const rolesCount = rolesResult[0]?.count ?? 0;

		// Check permissions table
		const permissionsResult = await db.select({ count: sql<number>`count(*)` }).from(permissions);
		const permissionsCount = permissionsResult[0]?.count ?? 0;

		// Check users table
		const usersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
		const usersCount = usersResult[0]?.count ?? 0;

		// Database is considered seeded if all three critical tables have data
		const isSeeded = rolesCount > 0 && permissionsCount > 0 && usersCount > 0;

		if (process.env.NODE_ENV === 'development') {
			console.log('[DB Init] Seed check:', { rolesCount, permissionsCount, usersCount, isSeeded });
		}

		return isSeeded;
	} catch (error) {
		// If tables don't exist or query fails, assume not seeded
		console.warn('[DB Init] Error checking seed status:', error instanceof Error ? error.message : error);
		return false;
	}
}

/**
 * Initialize database by auto-seeding if needed
 * - Silent skip if DATABASE_URL is not configured (optional DB)
 * - Throws error if DATABASE_URL exists but seeding fails
 */
export async function initializeDatabase(): Promise<void> {
	// Silent skip if DATABASE_URL not configured (DB is optional)
	if (!process.env.DATABASE_URL) {
		if (process.env.NODE_ENV === 'development') {
			console.log('[DB Init] DATABASE_URL not configured - skipping database initialization');
		}
		return;
	}

	try {
		console.log('[DB Init] Checking if database needs seeding...');

		// Check if already seeded
		const isSeeded = await isDatabaseSeeded();

		if (isSeeded) {
			console.log('[DB Init] Database already seeded - skipping');
			return;
		}

		console.log('[DB Init] Database empty - running seed...');

		// Import and run seed logic
		const { runSeed } = await import('./seed');
		await runSeed();

		console.log('[DB Init] Database seeding completed successfully');
	} catch (error) {
		// If DATABASE_URL is configured but seeding fails, this is an error
		console.error('[DB Init] Database initialization failed:', error);
		throw new Error(
			`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
