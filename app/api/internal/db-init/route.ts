/**
 * Internal API route for database initialization
 * Triggers auto-migration and seeding if database is not yet initialized
 * 
 * Security: Only accessible in development or from localhost
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	// Security: only allow in development or from localhost
	const host = request.headers.get('host') || '';
	const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
	const isDev = process.env.NODE_ENV === 'development';
	
	if (!isDev && !isLocalhost) {
		return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
	}

	try {
		const { initializeDatabase } = await import('@/lib/db/initialize');
		await initializeDatabase();
		
		return NextResponse.json({ 
			success: true, 
			message: 'Database initialization completed' 
		});
	} catch (error) {
		console.error('[DB Init API] Error:', error);
		return NextResponse.json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		}, { status: 500 });
	}
}
