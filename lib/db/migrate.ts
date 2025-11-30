import { migrate } from 'drizzle-orm/postgres-js/migrator';

/**
 * Check if migrations might be needed
 * 
 * We always return true to let Drizzle's migrate() handle the actual check.
 * Drizzle maintains its own __drizzle_migrations table and only runs migrations
 * that haven't been applied yet - this is idempotent and safe.
 * 
 * @returns Promise<boolean> - always true to ensure new migrations are applied
 */
export async function isMigrationNeeded(): Promise<boolean> {
	// Always return true - let Drizzle's migrate() handle idempotency
	// This ensures new migrations are always applied even on existing databases
	return true;
}

/**
 * Run Drizzle migrations from ./migrations folder
 * @returns Promise<boolean> - true if migrations succeeded, false if failed
 */
export async function runMigrations(): Promise<boolean> {
	try {
		console.log('[Migration] Starting database migrations...');

		const { db } = await import('./drizzle');

		// Run migrations from ./migrations folder
		await migrate(db, { migrationsFolder: './lib/db/migrations' });

		console.log('[Migration] ✓ Database migrations completed successfully');
		return true;
	} catch (error) {
		console.error('[Migration] ✗ Database migrations failed:', error instanceof Error ? error.message : error);

		// Log helpful message for developers
		console.error('[Migration] Please run migrations manually: yarn db:migrate');

		return false;
	}
}
