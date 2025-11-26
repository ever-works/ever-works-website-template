/**
 * Node.js-only instrumentation
 * Runs only in Node.js runtime (not Edge)
 * Used for database initialization and other Node.js-specific startup tasks
 */

export async function register() {
	// Initialize database (auto-seed if needed)
	try {
		const { initializeDatabase } = await import('@/lib/db/initialize');
		await initializeDatabase();
	} catch (error) {
		console.error('[Instrumentation Node] Database initialization error:', error);
		// Re-throw to prevent server startup if DB is configured but initialization fails
		throw error;
	}
}
