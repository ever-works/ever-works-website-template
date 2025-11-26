import { eq } from 'drizzle-orm';
import { seedStatus } from './schema';
import type { SeedStatus } from './schema';
import { isMigrationNeeded, runMigrations } from './migrate';

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

// Configuration constants for seed locking
const STALE_LOCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes - consider lock stale if held this long
const POLL_INTERVAL_MS = 2000; // 2 seconds - how often to check lock status
const MAX_WAIT_MS = 10 * 60 * 1000; // 10 minutes - maximum time to wait for lock

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Initialize database by auto-seeding if needed
 * - Silent skip if DATABASE_URL is not configured (optional DB)
 * - Automatically checks if database is seeded on every startup
 * - Seeds database if not already seeded
 * - Uses polling with stale lock detection to prevent race conditions
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

		console.log('[DB Init] Database not seeded - checking if migrations needed...');

		// Check if migrations are needed (seed_status table missing)
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
		let hasLock = false;

		// Try to acquire seed lock by inserting singleton record
		try {
			await db.insert(seedStatus).values({
				id: 'singleton',
				status: 'seeding',
				startedAt: new Date()
			});

			console.log('[DB Init] Seed lock acquired successfully');
			hasLock = true;
		} catch (lockError) {
			// Check if error is due to missing table (PostgreSQL error code 42P01)
			const isTableMissingError =
				lockError &&
				typeof lockError === 'object' &&
				'code' in lockError &&
				lockError.code === '42P01';

			if (isTableMissingError) {
				// Table doesn't exist - try auto-migration once
				console.log('[DB Init] seed_status table not found - attempting auto-migration...');

				const migrationSuccess = await runMigrations();

				if (!migrationSuccess) {
					console.warn('[DB Init] ⚠️  Auto-migration failed - skipping database initialization');
					console.warn('[DB Init] ⚠️  Please run migrations manually: yarn db:migrate');
					return;
				}

				// Retry lock acquisition after migration
				try {
					await db.insert(seedStatus).values({
						id: 'singleton',
						status: 'seeding',
						startedAt: new Date()
					});

					console.log('[DB Init] Seed lock acquired successfully after migration');
					hasLock = true;
				} catch {
					// If still fails, another instance likely grabbed the lock
					console.log('[DB Init] Lock held by another instance after migration - entering polling mode');
				}
			}

			// If we don't have lock yet, enter polling mode
			if (!hasLock) {
				// Lock already exists - need to poll until available or completed
				console.log('[DB Init] Seed lock held by another instance - entering polling mode');

			const startWaitTime = Date.now();

			// Poll until lock is available, seed completes, or timeout
			while (true) {
				// Check if we've exceeded maximum wait time
				const waitTime = Date.now() - startWaitTime;
				if (waitTime > MAX_WAIT_MS) {
					throw new Error(
						`[DB Init] Timeout waiting for seed lock after ${MAX_WAIT_MS / 1000}s. ` +
						`Another instance may be stuck. Check seed_status table manually.`
					);
				}

				// Get current seed status
				const status = await getSeedStatus();

				if (!status) {
					// Lock disappeared - try to acquire again
					console.log('[DB Init] Lock disappeared - attempting to acquire');
					try {
						await db.insert(seedStatus).values({
							id: 'singleton',
							status: 'seeding',
							startedAt: new Date()
						});
						hasLock = true;
						break;
					} catch {
						// Another instance grabbed it - continue polling
						console.log('[DB Init] Another instance acquired lock - continuing to poll');
						await sleep(POLL_INTERVAL_MS);
						continue;
					}
				}

				// Check if seeding completed
				if (status.status === 'completed') {
					console.log('[DB Init] Seeding completed by another instance - skipping');
					return;
				}

				// Check if lock is stale (instance crashed or hung)
				if (status.status === 'seeding') {
					const lockAge = Date.now() - new Date(status.startedAt).getTime();

					if (lockAge > STALE_LOCK_THRESHOLD_MS) {
						// Lock is stale - take it over
						console.warn(
							`[DB Init] Detected stale seed lock (held for ${lockAge / 1000}s) - taking over`
						);

						try {
							await db
								.update(seedStatus)
								.set({
									status: 'seeding',
									startedAt: new Date(),
									error: 'Taken over from stale lock'
								})
								.where(eq(seedStatus.id, 'singleton'));

							hasLock = true;
							break;
						} catch {
							// Update failed - continue polling
							console.warn('[DB Init] Failed to take over stale lock - continuing to poll');
							await sleep(POLL_INTERVAL_MS);
							continue;
						}
					}

					// Lock is active and fresh - wait and retry
					console.log('[DB Init] Another instance is actively seeding - waiting...');
					await sleep(POLL_INTERVAL_MS);
					continue;
				}

				// Check if previous seed failed
				if (status.status === 'failed') {
					console.log('[DB Init] Previous seed attempt failed - taking over to retry');

					try {
						await db
							.update(seedStatus)
							.set({
								status: 'seeding',
								startedAt: new Date(),
								error: null
							})
							.where(eq(seedStatus.id, 'singleton'));

						hasLock = true;
						break;
					} catch {
						// Update failed - continue polling
						console.warn('[DB Init] Failed to take over failed seed - continuing to poll');
						await sleep(POLL_INTERVAL_MS);
						continue;
					}
				}

				// Unknown status - wait and retry
				console.warn(`[DB Init] Unexpected seed status: ${status.status} - waiting...`);
				await sleep(POLL_INTERVAL_MS);
			}
			}
		}

		// If we don't have the lock at this point, something went wrong
		if (!hasLock) {
			throw new Error('[DB Init] Failed to acquire seed lock - this should never happen');
		}

		// We have the lock - run the seed
		// Pass manageStatus: false because we already manage the lock/status in this function
		console.log('[DB Init] Running database seed...');
		const { runSeed } = await import('./seed');
		await runSeed({ manageStatus: false });

		// Update status to completed after successful seed
		await db
			.update(seedStatus)
			.set({
				status: 'completed',
				completedAt: new Date()
			})
			.where(eq(seedStatus.id, 'singleton'));

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
