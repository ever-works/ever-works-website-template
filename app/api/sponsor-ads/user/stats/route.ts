import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sponsorAdService } from '@/lib/services/sponsor-ad.service';

/**
 * @swagger
 * /api/sponsor-ads/user/stats:
 *   get:
 *     tags: ["Sponsor Ads - User"]
 *     summary: "Get user's sponsor ad statistics"
 *     description: "Returns statistics for the authenticated user's sponsor ads including counts by status."
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: "User's sponsor ad statistics retrieved successfully"
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Internal server error"
 */
export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await sponsorAdService.getSponsorAdStatsByUser(session.user.id);

		return NextResponse.json({
			success: true,
			stats,
		});
	} catch (error) {
		console.error('Error fetching user sponsor ad stats:', error);
		return NextResponse.json({ success: false, error: 'Failed to fetch sponsor ad stats' }, { status: 500 });
	}
}
