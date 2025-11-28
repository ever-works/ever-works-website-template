import { eq, sql } from 'drizzle-orm';
import { seedStatus } from './schema';
import type { SeedStatus } from './schema';

/**
 * Get the current seed status from the database
 * @returns Promise<SeedStatus | null> - seed status record or null if not found
 */
async function getSeedStatus(): Promise<SeedStatus | null> {
	try {
		const { db } = await import('./drizzle');

		const result = await db
			.select()
			.from(seedStatus)
			.where(eq(seedStatus.id, 'singleton'))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		// If seed_status table doesn't exist or query fails, return null
		console.warn('[DB Init] Error checking seed status:', error instanceof Error ? error.message : error);
		return null;
	}
}

/**
 * Check if database has been seeded by checking seed_status table
 * @returns Promise<boolean> - true if database has been successfully seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
	const status = await getSeedStatus();

	if (!status) {
		// No seed status record - database not seeded
		return false;
	}

	// Database is seeded if status is 'completed'
	const isSeeded = status.status === 'completed';

	if (process.env.NODE_ENV === 'development') {
		console.log('[DB Init] Seed status:', {
			status: status.status,
			startedAt: status.startedAt,
			completedAt: status.completedAt,
			isSeeded
		});
	}

	return isSeeded;
}

/**
 * Run database seeding with status tracking
 * Assumes caller has already acquired advisory lock
 */
async function seedDatabase(): Promise<void> {
	const { db } = await import('./drizzle');

	// Create seed status record to indicate seeding is in progress
	await db.insert(seedStatus).values({
		status: 'seeding'
	});

	try {
		console.log('[DB Init] Running database seed...');
		const { runSeed } = await import('./seed');
		await runSeed();

		// Mark seed as completed
		await db
			.update(seedStatus)
			.set({
				status: 'completed',
				completedAt: new Date()
			})
			.where(eq(seedStatus.id, sql`'singleton'`));

		console.log('[DB Init] Database seeding completed successfully');
	} catch (error) {
		// Mark seed as failed
		await db
			.update(seedStatus)
			.set({
				status: 'failed',
				error: error instanceof Error ? error.message : 'Unknown error',
				completedAt: new Date()
			})
			.where(eq(seedStatus.id, sql`'singleton'`));

		throw error;
	}
}

/**
 * Initialize database by auto-migrating and seeding if needed
 * - Silent skip if DATABASE_URL is not configured (optional DB)
 * - Automatically checks if database is seeded on every startup
 * - Seeds database if not already seeded
 * - Uses Postgres advisory locks to prevent race conditions in multi-process deployments
 * - Throws error if DATABASE_URL exists but initialization fails
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

		console.log('[DB Init] Database not seeded - checking if migrations needed...');

		// Check if migrations are needed (seed_status table missing)
		const { isMigrationNeeded, runMigrations } = await import('./migrate');
		const migrationNeeded = await isMigrationNeeded();

		if (migrationNeeded) {
			console.log('[DB Init] Migrations needed - running auto-migration...');

			const migrationSuccess = await runMigrations();

			if (!migrationSuccess) {
				// Migration failed - log error and skip seeding
				console.warn('[DB Init] ⚠️  Auto-migration failed - skipping database initialization');
				console.warn('[DB Init] ⚠️  Please run migrations manually: yarn db:migrate');
				return;
			}

			console.log('[DB Init] Migrations completed - proceeding with seeding');
		}

		console.log('[DB Init] Attempting to acquire seed lock...');

		const { db } = await import('./drizzle');

		// Try to acquire advisory lock (12345 is arbitrary lock ID)
		// This prevents race conditions in multi-process deployments
		const lockResult = await db.execute(sql`SELECT pg_try_advisory_lock(12345) as locked`);
		const rows = (lockResult as { rows?: unknown[] }).rows ?? (Array.isArray(lockResult) ? lockResult : []);
		const gotLock = rows.length > 0 ? (rows[0] as { locked: boolean }).locked : false;

		if (!gotLock) {
			console.log('[DB Init] Another instance is seeding - skipping');
			return;
		}

		try {
			console.log('[DB Init] Seed lock acquired successfully');
			await seedDatabase();
		} finally {
			// Always release the advisory lock
			await db.execute(sql`SELECT pg_advisory_unlock(12345)`);
		}
	} catch (error) {
		// If DATABASE_URL is configured but initialization fails, this is an error
		console.error('[DB Init] Database initialization failed:', error);

		throw new Error(
			`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
