#!/usr/bin/env tsx
/**
 * Build-time database migration script for Vercel deployments
 * 
 * This script runs migrations during the build process, ensuring:
 * 1. Database schema is up-to-date before deployment
 * 2. Build fails if migrations fail (preventing broken deployments)
 * 3. All serverless functions have a consistent schema
 * 
 * Usage: tsx scripts/build-migrate.ts
 * 
 * Environment:
 * - Requires DATABASE_URL to be set
 * - Set SKIP_BUILD_MIGRATIONS=true to skip (e.g., for preview deployments without DB)
 */

import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables from .env files
config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
	console.log('[Build Migration] Starting database migration check...');

	// Allow skipping migrations for environments without database
	if (process.env.SKIP_BUILD_MIGRATIONS === 'true') {
		console.log('[Build Migration] SKIP_BUILD_MIGRATIONS=true, skipping migrations');
		process.exit(0);
	}

	// Check if DATABASE_URL is configured
	if (!process.env.DATABASE_URL) {
		console.log('[Build Migration] DATABASE_URL not configured, skipping migrations');
		console.log('[Build Migration] Set DATABASE_URL to enable build-time migrations');
		process.exit(0);
	}

	try {
		console.log('[Build Migration] DATABASE_URL is configured');
		console.log('[Build Migration] Running Drizzle migrations...');

		// Import and run migrations
		const { runMigrations } = await import('../lib/db/migrate');
		const success = await runMigrations();

		if (!success) {
			console.error('[Build Migration] ❌ Migrations failed!');
			console.error('[Build Migration] Please check your database connection and migration files');
			process.exit(1);
		}

		console.log('[Build Migration] ✅ Migrations completed successfully');

		// Verify critical tables/columns exist
		console.log('[Build Migration] Verifying schema...');
		const { db } = await import('../lib/db/drizzle');
		
		// Quick verification query to ensure warning_count column exists
		const result = await db.execute(sql`
			SELECT column_name FROM information_schema.columns 
			WHERE table_name = 'client_profiles' 
			AND column_name IN ('warning_count', 'suspended_at', 'banned_at')
		`);

		const rows = (result as { rows?: unknown[] }).rows ?? (Array.isArray(result) ? result : []);
		const columns = rows.map((r) => (r as Record<string, unknown>).column_name);

		const requiredColumns = ['warning_count', 'suspended_at', 'banned_at'];
		const missingColumns = requiredColumns.filter(col => !columns.includes(col));

		if (missingColumns.length > 0) {
			console.error('[Build Migration] ❌ Missing required columns:', missingColumns.join(', '));
			console.error('[Build Migration] Migration 0014 may not have been applied correctly');
			process.exit(1);
		}

		console.log('[Build Migration] ✅ Schema verification passed');
		console.log('[Build Migration] All required moderation columns exist:', requiredColumns.join(', '));

		process.exit(0);
	} catch (error) {
		console.error('[Build Migration] ❌ Migration error:', error);
		
		// In CI/Vercel, a database connection error should not block build
		// if the DB isn't available during build (some setups only have DB at runtime)
		if (process.env.VERCEL && error instanceof Error) {
			const errorMsg = error.message.toLowerCase();
			const isConnectionError = 
				errorMsg.includes('connect') ||
				errorMsg.includes('econnrefused') ||
				errorMsg.includes('etimedout') ||
				errorMsg.includes('timeout') ||
				errorMsg.includes('enotfound') ||
				errorMsg.includes('econnreset') ||
				errorMsg.includes('connection');
			
			if (isConnectionError) {
				console.log('[Build Migration] ⚠️ Database not reachable during build');
				console.log('[Build Migration] ⚠️ Migrations will run at startup via instrumentation hook');
				process.exit(0);
			}
		}

		process.exit(1);
	}
}

main();
