import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { surveyService } from '@/lib/services/survey.service';
import { Logger } from '@/lib/logger';

const logger = Logger.create('SurveyResponseDetailAPI');

/**
 * @swagger
 * /api/surveys/responses/{responseId}:
 *   get:
 *     tags: ["Surveys"]
 *     summary: "Get survey response by ID"
 *     description: "Retrieve a specific survey response (admin only)"
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "responseId"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Response ID"
 *     responses:
 *       200:
 *         description: "Response retrieved successfully"
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Response not found"
 *       500:
 *         description: "Internal server error"
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ responseId: string }> }
) {
    try {
        const session = await auth();
        
        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { responseId } = await params;
        const response = await surveyService.getResponseById(responseId);

        if (!response) {
            return NextResponse.json(
                { success: false, error: 'Response not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error('Error fetching response', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to fetch response' 
            },
            { status: 500 }
        );
    }
}

