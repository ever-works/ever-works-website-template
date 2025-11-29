import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';

/**
 * Check if migrations are needed by checking if seed_status table exists
 * @returns Promise<boolean> - true if migrations needed, false if already applied
 */
export async function isMigrationNeeded(): Promise<boolean> {
	try {
		const { db } = await import('./drizzle');

		// Check if seed_status table exists in PostgreSQL
		const result = await db.execute(
			sql`SELECT EXISTS (
				SELECT FROM information_schema.tables
				WHERE table_schema = 'public'
				AND table_name = 'seed_status'
			) as exists`
		);

		// Handle postgres-js result format (can be {rows: []} or array directly)
		const rows = (result as { rows?: unknown[] }).rows ?? (Array.isArray(result) ? result : []);
		const exists = rows.length > 0 ? (rows[0] as { exists: boolean }).exists : false;

		if (process.env.NODE_ENV === 'development') {
			console.log('[Migration] seed_status table exists:', exists);
		}

		// If table doesn't exist, migrations are needed
		return !exists;
	} catch (error) {
		// If we can't check, assume migrations are needed
		console.warn(
			'[Migration] Could not check if migrations needed:',
			error instanceof Error ? error.message : error
		);
		return true;
	}
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
