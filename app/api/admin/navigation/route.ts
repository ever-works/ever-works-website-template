import { NextRequest, NextResponse } from 'next/server';
import { configManager } from '@/lib/config-manager';
import { getCachedApiSession } from '@/lib/auth/cached-session';

/**
 * GET /api/admin/navigation
 * Retrieves custom_header and custom_footer from config.yml
 */
export async function GET(req: NextRequest) {
	try {
		// Check admin authentication
		const session = await getCachedApiSession(req);
		if (!session?.user?.isAdmin) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get navigation config
		const config = configManager.getConfig();
		const custom_header = config.custom_header || [];
		const custom_footer = config.custom_footer || [];

		return NextResponse.json(
			{
				custom_header,
				custom_footer
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching navigation:', error);
		return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 });
	}
}

/**
 * PATCH /api/admin/navigation
 * Updates custom_header or custom_footer in config.yml
 * Request body: { type: 'header' | 'footer', items: CustomNavigationItem[] }
 */
export async function PATCH(req: NextRequest) {
	try {
		// Check admin authentication
		const session = await getCachedApiSession(req);
		if (!session?.user?.isAdmin) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { type, items } = body;

		if (!type || (type !== 'header' && type !== 'footer')) {
			return NextResponse.json({ error: 'Type must be "header" or "footer"' }, { status: 400 });
		}

		if (!Array.isArray(items)) {
			return NextResponse.json({ error: 'Items must be an array' }, { status: 400 });
		}

		// Validate items structure
		for (const item of items) {
			if (
				!item ||
				typeof item !== 'object' ||
				Array.isArray(item) ||
				typeof item.label !== 'string' ||
				typeof item.path !== 'string' ||
				!item.label.trim() ||
				!item.path.trim()
			) {
				return NextResponse.json(
					{ error: 'Each item must have non-empty "label" and "path" string fields' },
					{ status: 400 }
				);
			}
		}

		// Update the navigation config
		const key = type === 'header' ? 'custom_header' : 'custom_footer';
		const success = configManager.updateNestedKey(key, items);

		if (!success) {
			return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 });
		}

		return NextResponse.json({ success: true, type, items }, { status: 200 });
	} catch (error) {
		console.error('Error updating navigation:', error);
		return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 });
	}
}
