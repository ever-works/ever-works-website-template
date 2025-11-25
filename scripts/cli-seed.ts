/**
 * CLI entry point for manual database seeding
 * Usage: yarn db:seed
 */

import { runSeed } from '../lib/db/seed';

async function main() {
	try {
		await runSeed();
		process.exit(0);
	} catch (err) {
		console.error('Seed failed:', err);
		process.exit(1);
	}
}

main();
