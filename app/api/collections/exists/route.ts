import { NextRequest, NextResponse } from 'next/server';
import { collectionRepository } from '@/lib/repositories/collection.repository';

/**
 * API endpoint to check if collections exist
 * Returns { exists: boolean, count: number }
 */
export async function GET(request: NextRequest) {
	try {
		// Fetch only active collections (default behavior of findAll)
		const collections = await collectionRepository.findAll({ includeInactive: false });

		const hasCollections = Array.isArray(collections) && collections.length > 0;

		return NextResponse.json({
			exists: hasCollections,
			count: collections?.length || 0
		});
	} catch (error) {
		// Only log errors in development mode
		if (process.env.NODE_ENV === 'development') {
			console.error('Error checking collections existence:', error);
		}
		// On error, assume collections don't exist to be safe
		return NextResponse.json({
			exists: false,
			count: 0
		});
	}
}
