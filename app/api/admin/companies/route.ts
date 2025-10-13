import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listCompanies } from '@/lib/db/queries';

/**
 * @swagger
 * /api/admin/companies:
 *   get:
 *     tags: ["Admin - Companies"]
 *     summary: "List companies"
 *     description: "Returns a paginated list of companies with filtering options. Supports search by name/domain, status filtering. Requires admin privileges."
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
 *         example: 1
 *       - name: "limit"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: "Number of companies per page"
 *         example: 10
 *       - name: "q"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *         description: "Search term for company name or domain (case-insensitive)"
 *         example: "acme"
 *       - name: "status"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["active", "inactive"]
 *         description: "Filter by company status"
 *         example: "active"
 *     responses:
 *       200:
 *         description: "Companies retrieved successfully"
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
 *                     companies:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Company"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     total:
 *                       type: integer
 *                       example: 47
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                   required: ["page", "totalPages", "total", "limit"]
 *               required: ["success", "data", "meta"]
 *             example:
 *               success: true
 *               data:
 *                 companies:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Acme Corporation"
 *                     website: "https://acme.com"
 *                     domain: "acme.com"
 *                     slug: "acme-corporation"
 *                     status: "active"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-20T14:45:00.000Z"
 *                   - id: "660e8400-e29b-41d4-a716-446655440001"
 *                     name: "Beta Industries"
 *                     website: "https://beta.io"
 *                     domain: "beta.io"
 *                     slug: "beta-industries"
 *                     status: "active"
 *                     createdAt: "2024-01-16T09:15:00.000Z"
 *                     updatedAt: "2024-01-20T16:20:00.000Z"
 *               meta:
 *                 page: 1
 *                 totalPages: 5
 *                 total: 47
 *                 limit: 10
 *       401:
 *         description: "Unauthorized - Admin access required"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch companies"
 */
export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.isAdmin) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const q = searchParams.get('q') || undefined;
		const status = searchParams.get('status') as 'active' | 'inactive' | undefined;

		const result = await listCompanies({
			page,
			limit,
			search: q,
			status
		});

		return NextResponse.json({
			success: true,
			data: { companies: result.companies },
			meta: {
				page: result.page,
				totalPages: result.totalPages,
				total: result.total,
				limit: result.limit
			}
		});
	} catch (error) {
		console.error('Error fetching companies:', error);
		return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
	}
}
