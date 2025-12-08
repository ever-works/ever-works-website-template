import { NextRequest, NextResponse } from 'next/server';
import { requireClientAuth, serverErrorResponse, badRequestResponse } from '@/lib/utils/client-auth';
import { getClientItemRepository } from '@/lib/repositories/client-item.repository';
import { clientItemsListQuerySchema } from '@/lib/validations/client-item';

/**
 * @swagger
 * /api/client/items:
 *   get:
 *     tags: ["Client - Items"]
 *     summary: "Get user's items list"
 *     description: "Returns a paginated list of items submitted by the authenticated user with optional filtering by status and search."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "page"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: "Page number for pagination"
 *       - name: "limit"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: "Number of items per page"
 *       - name: "status"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["all", "draft", "pending", "approved", "rejected"]
 *         description: "Filter by item status"
 *       - name: "search"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *         description: "Search by item name or description"
 *     responses:
 *       200:
 *         description: "Items list retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     draft:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     approved:
 *                       type: integer
 *                     rejected:
 *                       type: integer
 *                     deleted:
 *                       type: integer
 *       401:
 *         description: "Unauthorized - Authentication required"
 *       500:
 *         description: "Internal server error"
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
    const validationResult = clientItemsListQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((issue) => issue.message).join(', ');
      return badRequestResponse(errorMessage);
    }

    const { page, limit, status, search, sortBy, sortOrder } = validationResult.data;

    // Get client item repository
    const clientItemRepository = getClientItemRepository();

    // Fetch items for user
    const result = await clientItemRepository.findByUserPaginated(userId, {
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder
    });

    return NextResponse.json({
      success: true,
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      stats: result.stats,
    });

  } catch (error) {
    return serverErrorResponse(error, 'Failed to fetch items');
  }
}
