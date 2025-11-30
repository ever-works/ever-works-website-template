import { migrate } from 'drizzle-orm/postgres-js/migrator';

/**
 * Run Drizzle migrations from ./migrations folder
 * 
 * This is safe to call on every startup because Drizzle's migrate() is idempotent:
 * - It tracks applied migrations in a __drizzle_migrations table
 * - It only runs migrations that haven't been applied yet
 * - Already-applied migrations are automatically skipped
 * 
 * @returns Promise<boolean> - true if migrations succeeded (or nothing to do), false if failed
 */
export async function runMigrations(): Promise<boolean> {
	try {
		console.log('[Migration] Running database migrations...');

		const { db } = await import('./drizzle');

		// Run migrations from ./migrations folder
		// Drizzle automatically skips already-applied migrations
		await migrate(db, { migrationsFolder: './lib/db/migrations' });

		console.log('[Migration] ✓ Migrations completed (new migrations applied or already up-to-date)');
		return true;
	} catch (error) {
		console.error('[Migration] ✗ Database migrations failed:', error instanceof Error ? error.message : error);
		console.error('[Migration] Please run migrations manually: pnpm db:migrate');
		return false;
	}
}
