import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ItemRepository } from '@/lib/repositories/item.repository';

const itemRepository = new ItemRepository();

/**
 * @swagger
 * /api/admin/items/stats:
 *   get:
 *     tags: ["Admin - Items"]
 *     summary: "Get item statistics"
 *     description: "Returns comprehensive statistics about items including counts by status, categories, tags, featured items, and other metrics for admin dashboard and analytics. Requires admin privileges."
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: "Item statistics retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: "Total number of items"
 *                       example: 1247
 *                     statusCounts:
 *                       type: object
 *                       properties:
 *                         draft:
 *                           type: integer
 *                           description: "Number of draft items"
 *                           example: 45
 *                         pending:
 *                           type: integer
 *                           description: "Number of pending items"
 *                           example: 23
 *                         approved:
 *                           type: integer
 *                           description: "Number of approved items"
 *                           example: 1156
 *                         rejected:
 *                           type: integer
 *                           description: "Number of rejected items"
 *                           example: 23
 *                     featuredItems:
 *                       type: integer
 *                       description: "Number of featured items"
 *                       example: 89
 *                     categoryCounts:
 *                       type: object
 *                       description: "Items count by category"
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         productivity: 234
 *                         design: 156
 *                         development: 189
 *                         business: 145
 *                     tagCounts:
 *                       type: object
 *                       description: "Items count by tag"
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         saas: 345
 *                         free: 234
 *                         paid: 567
 *                         collaboration: 123
 *                     recentItems:
 *                       type: integer
 *                       description: "Items created in the last 30 days"
 *                       example: 67
 *                     averageRating:
 *                       type: number
 *                       description: "Average rating across all items"
 *                       example: 4.2
 *                     totalViews:
 *                       type: integer
 *                       description: "Total views across all items"
 *                       example: 45678
 *                     totalVotes:
 *                       type: integer
 *                       description: "Total votes across all items"
 *                       example: 3456
 *               required: ["success", "data"]
 *             example:
 *               success: true
 *               data:
 *                 totalItems: 1247
 *                 statusCounts:
 *                   draft: 45
 *                   pending: 23
 *                   approved: 1156
 *                   rejected: 23
 *                 featuredItems: 89
 *                 categoryCounts:
 *                   productivity: 234
 *                   design: 156
 *                   development: 189
 *                   business: 145
 *                 tagCounts:
 *                   saas: 345
 *                   free: 234
 *                   paid: 567
 *                   collaboration: 123
 *                 recentItems: 67
 *                 averageRating: 4.2
 *                 totalViews: 45678
 *                 totalVotes: 3456
 *       401:
 *         description: "Unauthorized - Admin access required"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized. Admin access required."
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch item stats"
 */
export async function GET() {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Get stats from repository
    const stats = await itemRepository.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Failed to fetch item stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch item stats' 
      },
      { status: 500 }
    );
  }
} 