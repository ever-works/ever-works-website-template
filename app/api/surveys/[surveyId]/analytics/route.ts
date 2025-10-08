import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { surveyService } from '@/lib/services/survey.service';

/**
 * @swagger
 * /api/surveys/{surveyId}/analytics:
 *   get:
 *     tags: ["Surveys"]
 *     summary: "Get survey analytics"
 *     description: "Retrieve analytics data for a specific survey (admin only)"
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "surveyId"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Survey ID"
 *       - name: "itemId"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *         description: "Filter by item ID"
 *       - name: "startDate"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter by start date"
 *       - name: "endDate"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter by end date"
 *     responses:
 *       200:
 *         description: "Analytics retrieved successfully"
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
 *                     surveyId:
 *                       type: string
 *                     surveySlug:
 *                       type: string
 *                     totalResponses:
 *                       type: integer
 *                     lastResponseAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Survey not found"
 *       500:
 *         description: "Internal server error"
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ surveyId: string }> }
) {
    try {
        const session = await auth();
        
        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { surveyId } = await params;
        const { searchParams } = new URL(request.url);
        
        const filters = {
            itemId: searchParams.get('itemId') || undefined,
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
        };

        const analytics = await surveyService.getAnalytics(surveyId, filters);

        return NextResponse.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        
        if (error instanceof Error && error.message === 'Survey not found') {
            return NextResponse.json(
                { success: false, error: 'Survey not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to fetch analytics' 
            },
            { status: 500 }
        );
    }
}

