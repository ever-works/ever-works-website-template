import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';

/**
 * Check if there are pending migrations by comparing journal entries with applied migrations
 * @returns Promise<boolean> - true if migrations needed, false if all migrations applied
 */
export async function isMigrationNeeded(): Promise<boolean> {
	try {
		const { db } = await import('./drizzle');

		// Check if drizzle migrations table exists
		const tableCheck = await db.execute(
			sql`SELECT EXISTS (
				SELECT FROM information_schema.tables
				WHERE table_schema = 'drizzle'
				AND table_name = '__drizzle_migrations'
			) as exists`
		);

		const tableRows = (tableCheck as { rows?: unknown[] }).rows ?? (Array.isArray(tableCheck) ? tableCheck : []);
		const tableExists = tableRows.length > 0 ? (tableRows[0] as { exists: boolean }).exists : false;

		if (!tableExists) {
			console.log('[Migration] Drizzle migrations table does not exist - migrations needed');
			return true;
		}

		// Get count of applied migrations
		const appliedResult = await db.execute(
			sql`SELECT COUNT(*) as count FROM drizzle.__drizzle_migrations`
		);
		const appliedRows = (appliedResult as { rows?: unknown[] }).rows ?? (Array.isArray(appliedResult) ? appliedResult : []);
		const appliedCount = appliedRows.length > 0 ? Number((appliedRows[0] as { count: string | number }).count) : 0;

		// Read journal to get total migrations
		const fs = await import('fs');
		const path = await import('path');
		const journalPath = path.join(process.cwd(), 'lib/db/migrations/meta/_journal.json');
		
		let totalMigrations = 0;
		try {
			const journalContent = fs.readFileSync(journalPath, 'utf-8');
			const journal = JSON.parse(journalContent);
			totalMigrations = journal.entries?.length ?? 0;
		} catch {
			// Journal not found - let Drizzle handle it
			console.log('[Migration] Could not read journal - will run migrations');
			return true;
		}

		const pendingCount = totalMigrations - appliedCount;
		
		if (process.env.NODE_ENV === 'development' || pendingCount > 0) {
			console.log(`[Migration] Applied: ${appliedCount}, Total: ${totalMigrations}, Pending: ${pendingCount}`);
		}

		return pendingCount > 0;
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
