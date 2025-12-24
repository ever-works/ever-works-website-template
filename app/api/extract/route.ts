import { NextResponse } from 'next/server';

/**
 * Secure proxy route for URL extraction
 * This route runs on the server and uses the private API_TOKEN
 * to communicate with the backend metadata extraction service.
 */
export async function POST(request: Request) {
	try {
		const { url, existingCategories } = await request.json();

		if (!url) {
			return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
		}

		// Use the private API_TOKEN from environment variables
		const apiToken = process.env.API_TOKEN;

		// The internal backend endpoint
		const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api';
		const extractionEndpoint = `${backendUrl.replace(/\/+$/, '')}/extract-item-details`;

		const response = await fetch(extractionEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {})
			},
			body: JSON.stringify({
				source_url: url,
				existing_data: existingCategories && existingCategories.length > 0 ? existingCategories : undefined
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ success: false, error: data.message || 'Failed to extract data from backend' },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('[ExtractProxy] Error:', error);
		return NextResponse.json({ success: false, error: 'Internal server error during extraction' }, { status: 500 });
	}
}
