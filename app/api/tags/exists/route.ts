import { NextRequest, NextResponse } from 'next/server';
import { fetchItems } from '@/lib/content';

/**
 * @swagger
 * /api/tags/exists:
 *   get:
 *     tags: ["Tags"]
 *     summary: "Check if tags exist"
 *     description: "Checks if there are any tags available in the system. Returns a boolean indicating existence and the count of tags. This is a public endpoint that doesn't require authentication."
 *     parameters:
 *       - name: locale
 *         in: query
 *         description: "Locale for fetching tags (default: en)"
 *         required: false
 *         schema:
 *           type: string
 *           example: "en"
 *     responses:
 *       200:
 *         description: "Tags existence checked successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: "Whether any tags exist"
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: "Number of tags"
 *                   example: 15
 *               required: ["exists", "count"]
 *             examples:
 *               tags_exist:
 *                 summary: "Tags exist"
 *                 value:
 *                   exists: true
 *                   count: 15
 *               no_tags:
 *                 summary: "No tags exist"
 *                 value:
 *                   exists: false
 *                   count: 0
 *       500:
 *         description: "Internal server error - Failed to check tags existence"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: false
 *                 count:
 *                   type: integer
 *                   example: 0
 *               required: ["exists", "count"]
 */
export async function GET(request: NextRequest) {
	try {
		// Fetch items to get tags
		// We use the default locale, but this could be made locale-aware if needed
		const locale = request?.nextUrl?.searchParams?.get('locale') || 'en';
		const { tags } = await fetchItems({ lang: locale });

		const hasTags = Array.isArray(tags) && tags.length > 0;

		return NextResponse.json({
			exists: hasTags,
			count: tags?.length || 0
		});
	} catch (error) {
		// Only log errors in development mode
		if (process.env.NODE_ENV === 'development') {
			console.error('Error checking tags existence:', error);
		}
		// On error, assume tags don't exist to be safe
		return NextResponse.json({
			exists: false,
			count: 0
		});
	}
}
