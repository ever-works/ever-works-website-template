import { NextRequest, NextResponse } from 'next/server';
import { requireClientAuth, serverErrorResponse, badRequestResponse } from '@/lib/utils/client-auth';
import { getClientDashboardRepository } from '@/lib/repositories/client-dashboard.repository';
import { userActivityQuerySchema } from '@/lib/validations/client-dashboard';

/**
 * @swagger
 * /api/client/dashboard/activity:
 *   get:
 *     tags: ["Client - Dashboard"]
 *     summary: "Get user activity history"
 *     description: "Returns paginated list of user's votes and comments (activity made by the user)."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: "Page number"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: "Items per page"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["all", "comment", "vote"]
 *           default: "all"
 *         description: "Filter by activity type"
 *     responses:
 *       200:
 *         description: "Activity retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       itemId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       type:
 *                         type: string
 *                         enum: ["comment", "vote"]
 *                       content:
 *                         type: string
 *                         nullable: true
 *                         description: "Comment content (only for comments)"
 *                       rating:
 *                         type: integer
 *                         nullable: true
 *                         description: "Comment rating (only for comments)"
 *                       voteType:
 *                         type: string
 *                         enum: ["upvote", "downvote"]
 *                         nullable: true
 *                         description: "Vote type (only for votes)"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: "Bad request - Invalid query parameters"
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
 *                   example: "Page must be at least 1"
 *       401:
 *         description: "Unauthorized - Authentication required"
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
 *                   example: "Unauthorized. Please sign in to continue."
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
 *                   example: "Failed to fetch user activity"
 */
export async function GET(request: NextRequest) {
    try {
        // Check client authentication
        const authResult = await requireClientAuth();
        if (!authResult.success) {
            return authResult.response;
        }
        const { userId } = authResult;

        // Parse and validate query parameters
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        const validationResult = userActivityQuerySchema.safeParse(queryParams);

        if (!validationResult.success) {
            const errorMessage = validationResult.error.issues.map(issue => issue.message).join(', ');
            return badRequestResponse(errorMessage);
        }

        const { page, limit, type } = validationResult.data;

        // Get dashboard repository and fetch activity
        const dashboardRepository = getClientDashboardRepository();
        const result = await dashboardRepository.getUserActivity(userId, {
            page,
            limit,
            type,
        });

        return NextResponse.json({
            success: true,
            activities: result.activities,
            pagination: result.pagination,
        });
    } catch (error) {
        return serverErrorResponse(error, 'Failed to fetch user activity');
    }
}
