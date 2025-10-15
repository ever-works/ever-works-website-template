import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { featuredItems } from '@/lib/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';

/**
 * @swagger
 * /api/admin/featured-items:
 *   get:
 *     tags: ["Admin - Featured Items"]
 *     summary: "List featured items"
 *     description: "Returns a paginated list of featured items with optional filtering by active status. Requires authentication."
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
 *         description: "Number of items per page"
 *         example: 10
 *       - name: "active"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: "Filter by active status (true = only active items)"
 *         example: "true"
 *     responses:
 *       200:
 *         description: "Featured items retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/FeaturedItem"
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
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *                   required: ["page", "limit", "total", "totalPages", "hasNext", "hasPrev"]
 *               required: ["success", "data", "pagination"]
 *       400:
 *         description: "Bad request - Invalid pagination parameters"
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
 *             examples:
 *               invalid_page:
 *                 value:
 *                   success: false
 *                   error: "Invalid page parameter. Must be a positive integer."
 *               invalid_limit:
 *                 value:
 *                   success: false
 *                   error: "Invalid limit parameter. Must be between 1 and 100."
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
 *                   example: "Unauthorized"
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
 *                   example: "Failed to fetch featured items"
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate pagination parameters
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Validate page parameter
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid page parameter. Must be a positive integer.' },
        { status: 400 }
      );
    }

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      );
    }

    const activeOnly = searchParams.get('active') === 'true';
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (activeOnly) {
      conditions.push(eq(featuredItems.isActive, true));
    }

    // Get featured items with pagination
    const featuredItemsList = await db
      .select()
      .from(featuredItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(featuredItems.featuredOrder), desc(featuredItems.featuredAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(featuredItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: featuredItemsList,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured items' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/featured-items:
 *   post:
 *     tags: ["Admin - Featured Items"]
 *     summary: "Create featured item"
 *     description: "Features an item by adding it to the featured items list. Prevents duplicate featuring of the same item. Requires authentication."
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemSlug:
 *                 type: string
 *                 description: "Unique item identifier/slug"
 *                 example: "awesome-productivity-tool"
 *               itemName:
 *                 type: string
 *                 description: "Display name of the item"
 *                 example: "Awesome Productivity Tool"
 *               itemIconUrl:
 *                 type: string
 *                 format: uri
 *                 description: "URL to the item's icon/logo"
 *                 example: "https://example.com/icons/productivity-tool.png"
 *               itemCategory:
 *                 type: string
 *                 description: "Category of the item"
 *                 example: "Productivity"
 *               itemDescription:
 *                 type: string
 *                 description: "Brief description of the item"
 *                 example: "A powerful tool to boost your productivity"
 *               featuredOrder:
 *                 type: integer
 *                 description: "Display order (higher numbers appear first)"
 *                 default: 0
 *                 example: 10
 *               featuredUntil:
 *                 type: string
 *                 format: date-time
 *                 description: "Optional expiration date for featuring"
 *                 example: "2024-12-31T23:59:59.000Z"
 *             required: ["itemSlug", "itemName"]
 *     responses:
 *       200:
 *         description: "Item featured successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/FeaturedItem"
 *                 message:
 *                   type: string
 *                   example: "Item featured successfully"
 *               required: ["success", "data", "message"]
 *       400:
 *         description: "Bad request - Invalid input or item already featured"
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
 *                   examples:
 *                     missing_fields: "Item slug and name are required"
 *                     already_featured: "Item is already featured"
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
 *                   example: "Unauthorized"
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
 *                   example: "Failed to create featured item"
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      itemSlug,
      itemName,
      itemIconUrl,
      itemCategory,
      itemDescription,
      featuredOrder = 0,
      featuredUntil,
    } = body;

    if (!itemSlug || !itemName) {
      return NextResponse.json(
        { success: false, error: 'Item slug and name are required' },
        { status: 400 }
      );
    }

    // Check if item is already featured
    const existingFeatured = await db
      .select()
      .from(featuredItems)
      .where(
        and(
          eq(featuredItems.itemSlug, itemSlug),
          eq(featuredItems.isActive, true)
        )
      )
      .limit(1);

    if (existingFeatured.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Item is already featured' },
        { status: 400 }
      );
    }

    // Create featured item
    const newFeaturedItem = await db
      .insert(featuredItems)
      .values({
        itemSlug,
        itemName,
        itemIconUrl,
        itemCategory,
        itemDescription,
        featuredOrder,
        featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
        featuredBy: session.user.id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newFeaturedItem[0],
      message: 'Item featured successfully',
    });
  } catch (error) {
    console.error('Error creating featured item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create featured item' },
      { status: 500 }
    );
  }
}
