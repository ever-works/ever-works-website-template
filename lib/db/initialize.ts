import { eq } from 'drizzle-orm';
import { seedStatus } from './schema';

/**
 * Check if database has been seeded by checking seed_status table
 * @returns Promise<boolean> - true if database has been successfully seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
	try {
		const { db } = await import('./drizzle');

		// Check seed_status table for completion
		const result = await db
			.select()
			.from(seedStatus)
			.where(eq(seedStatus.id, 'singleton'))
			.limit(1);

		const status = result[0];

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
	} catch (error) {
		// If seed_status table doesn't exist or query fails, assume not seeded
		console.warn('[DB Init] Error checking seed status:', error instanceof Error ? error.message : error);
		return false;
	}
}

/**
 * Initialize database by auto-seeding if needed
 * - Silent skip if DATABASE_URL is not configured (optional DB)
 * - Automatically checks if database is seeded on every startup
 * - Seeds database if not already seeded
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

		console.log('[DB Init] Database empty - attempting to acquire seed lock...');

		// Try to acquire seed lock by inserting singleton record
		// If another instance already inserted it, this will fail due to unique constraint
		const { db } = await import('./drizzle');

		try {
			await db.insert(seedStatus).values({
				id: 'singleton',
				status: 'seeding',
				startedAt: new Date()
			});

			console.log('[DB Init] Seed lock acquired - running seed...');
		} catch {
			// Another instance is seeding or already seeded
			// Check if it completed or is still in progress
			const existingStatus = await isDatabaseSeeded();

			if (existingStatus) {
				console.log('[DB Init] Another instance completed seeding - skipping');
				return;
			}

			// Still seeding - wait and check again
			console.log('[DB Init] Another instance is currently seeding - waiting...');
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

			const recheckStatus = await isDatabaseSeeded();
			if (recheckStatus) {
				console.log('[DB Init] Seeding completed by another instance');
				return;
			}

			// If still not completed after wait, something may be wrong
			console.warn('[DB Init] Seed appears stuck - proceeding cautiously');
			// Continue to prevent startup deadlock, but log warning
		}

		// Import and run seed logic
		const { runSeed } = await import('./seed');
		await runSeed();

		console.log('[DB Init] Database seeding completed successfully');
	} catch (error) {
		// If DATABASE_URL is configured but seeding fails, this is an error
		console.error('[DB Init] Database initialization failed:', error);

		// Mark seed as failed in database if possible
		try {
			const { db } = await import('./drizzle');
			await db
				.update(seedStatus)
				.set({
					status: 'failed',
					error: error instanceof Error ? error.message : 'Unknown error',
					completedAt: new Date()
				})
				.where(eq(seedStatus.id, 'singleton'));
		} catch {
			// Ignore errors updating status - original error is more important
		}

		throw new Error(
			`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
