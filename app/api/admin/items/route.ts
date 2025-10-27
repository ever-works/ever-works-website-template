import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ItemRepository } from '@/lib/repositories/item.repository';
import { CreateItemRequest } from '@/lib/types/item';
import { validatePaginationParams } from '@/lib/utils/pagination-validation';

const itemRepository = new ItemRepository();

/**
 * @swagger
 * /api/admin/items:
 *   get:
 *     tags: ["Admin - Items"]
 *     summary: "Get paginated items list"
 *     description: "Returns a paginated list of items with optional filtering by status, category, and tags. Supports comprehensive filtering and search capabilities for admin management. Requires admin privileges."
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
 *       - name: "status"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["draft", "pending", "approved", "rejected"]
 *         description: "Filter by item status"
 *         example: "approved"
 *       - name: "category"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *         description: "Filter by category"
 *         example: "productivity"
 *       - name: "tag"
 *         in: "query"
 *         required: false
 *         schema:
 *           type: string
 *         description: "Filter by tag"
 *         example: "saas"
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
 *                   example: true
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Item"
 *                 total:
 *                   type: integer
 *                   description: "Total number of items"
 *                   example: 156
 *                 page:
 *                   type: integer
 *                   description: "Current page number"
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   description: "Number of items per page"
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   description: "Total number of pages"
 *                   example: 16
 *               required: ["success", "items", "total", "page", "limit", "totalPages"]
 *             example:
 *               success: true
 *               items:
 *                 - id: "item_123abc"
 *                   name: "Awesome Productivity Tool"
 *                   slug: "awesome-productivity-tool"
 *                   description: "A powerful tool to boost your productivity"
 *                   source_url: "https://example.com/tool"
 *                   category: ["productivity", "business"]
 *                   tags: ["saas", "productivity", "collaboration"]
 *                   featured: true
 *                   icon_url: "https://example.com/icon.png"
 *                   status: "approved"
 *                   created_at: "2024-01-20T10:30:00.000Z"
 *                   updated_at: "2024-01-20T14:45:00.000Z"
 *                 - id: "item_456def"
 *                   name: "Great Design Tool"
 *                   slug: "great-design-tool"
 *                   description: "Professional design tool for creators"
 *                   source_url: "https://example.com/design"
 *                   category: ["design", "creative"]
 *                   tags: ["design", "graphics", "creative"]
 *                   featured: false
 *                   icon_url: "https://example.com/design-icon.png"
 *                   status: "pending"
 *                   created_at: "2024-01-19T15:20:00.000Z"
 *                   updated_at: "2024-01-19T15:20:00.000Z"
 *               total: 156
 *               page: 1
 *               limit: 10
 *               totalPages: 16
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
 *                   example: "Failed to fetch items"
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Validate pagination parameters
    const paginationResult = validatePaginationParams(searchParams);
    if ('error' in paginationResult) {
      return NextResponse.json(
        { success: false, error: paginationResult.error },
        { status: paginationResult.status }
      );
    }
    const { page, limit } = paginationResult;

    const statusParam = searchParams.get('status');
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;

    // Validate status parameter
    const validStatuses = ['draft', 'pending', 'approved', 'rejected'] as const;
    const status = statusParam && validStatuses.includes(statusParam as any) 
      ? (statusParam as 'draft' | 'pending' | 'approved' | 'rejected') 
      : undefined;

    // Get paginated items
    const result = await itemRepository.findAllPaginated(page, limit, {
      status,
      category,
      tag,
    });

    return NextResponse.json({
      success: true,
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });

  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch items' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/items:
 *   post:
 *     tags: ["Admin - Items"]
 *     summary: "Create new item"
 *     description: "Creates a new item with comprehensive validation including duplicate checks for ID and slug. Supports all item properties including categories, tags, featured status, and initial status. Requires admin privileges."
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: "Unique item identifier"
 *                 example: "item_123abc"
 *               name:
 *                 type: string
 *                 description: "Item name"
 *                 example: "Awesome Productivity Tool"
 *               slug:
 *                 type: string
 *                 description: "URL-friendly slug (must be unique)"
 *                 example: "awesome-productivity-tool"
 *               description:
 *                 type: string
 *                 description: "Item description"
 *                 example: "A powerful tool to boost your productivity"
 *               source_url:
 *                 type: string
 *                 format: uri
 *                 description: "Source URL of the item"
 *                 example: "https://example.com/tool"
 *               category:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Item categories"
 *                 example: ["productivity", "business"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Item tags"
 *                 example: ["saas", "productivity", "collaboration"]
 *               featured:
 *                 type: boolean
 *                 description: "Whether the item is featured"
 *                 default: false
 *                 example: true
 *               icon_url:
 *                 type: string
 *                 format: uri
 *                 description: "URL to the item's icon"
 *                 example: "https://example.com/icon.png"
 *               status:
 *                 type: string
 *                 enum: ["draft", "pending", "approved", "rejected"]
 *                 description: "Initial item status"
 *                 default: "draft"
 *                 example: "draft"
 *             required: ["id", "name", "slug", "description", "source_url"]
 *     responses:
 *       201:
 *         description: "Item created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 item:
 *                   $ref: "#/components/schemas/Item"
 *                 message:
 *                   type: string
 *                   description: "Success message"
 *                   example: "Item created successfully"
 *               required: ["success", "item", "message"]
 *             example:
 *               success: true
 *               item:
 *                 id: "item_123abc"
 *                 name: "Awesome Productivity Tool"
 *                 slug: "awesome-productivity-tool"
 *                 description: "A powerful tool to boost your productivity"
 *                 source_url: "https://example.com/tool"
 *                 category: ["productivity", "business"]
 *                 tags: ["saas", "productivity", "collaboration"]
 *                 featured: true
 *                 icon_url: "https://example.com/icon.png"
 *                 status: "draft"
 *                 created_at: "2024-01-20T10:30:00.000Z"
 *                 updated_at: "2024-01-20T10:30:00.000Z"
 *               message: "Item created successfully"
 *       400:
 *         description: "Bad request - Invalid input or missing required fields"
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
 *                   example: "Item ID, name, slug, description, and source URL are required"
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
 *       409:
 *         description: "Conflict - Duplicate ID or slug"
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
 *                     duplicate_id: "Item with ID 'item_123abc' already exists"
 *                     duplicate_slug: "Item with slug 'awesome-tool' already exists"
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
 *                   example: "Failed to create item"
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      id,
      name,
      slug,
      description,
      source_url,
      category,
      tags,
      brand,
      featured,
      icon_url,
      status
    }: CreateItemRequest = body;

    // Validate required fields
    if (!id || !name || !slug || !description || !source_url) {
      return NextResponse.json(
        { success: false, error: "Item ID, name, slug, description, and source URL are required" },
        { status: 400 }
      );
    }

    // Check for duplicate ID
    const isDuplicateId = await itemRepository.checkDuplicateId(id);
    if (isDuplicateId) {
      return NextResponse.json(
        { success: false, error: `Item with ID '${id}' already exists` },
        { status: 409 }
      );
    }

    // Check for duplicate slug
    const isDuplicateSlug = await itemRepository.checkDuplicateSlug(slug);
    if (isDuplicateSlug) {
      return NextResponse.json(
        { success: false, error: `Item with slug '${slug}' already exists` },
        { status: 409 }
      );
    }

    // Create item
    const item = await itemRepository.create({
      id,
      name,
      slug,
      description,
      source_url,
      category: category || [],
      tags: tags || [],
      featured: featured || false,
      icon_url,
      status: status || 'draft',
    });

    // Direct CRM sync: auto-create company from brand field, link item, and sync to CRM
    try {
      // 1. Check if brand field is provided
      const brandName = brand?.trim();
      if (!brandName) {
        console.log(`[CRM Sync] No brand field provided for item ${item.slug}, skipping company creation`);
      } else {
        // 2. Extract domain from source URL for deduplication
        let domain: string | null = null;
        try {
          const sourceUrl = new URL(item.source_url);
          domain = sourceUrl.hostname.toLowerCase().replace(/^www\./, '');
        } catch (urlError) {
          console.warn(`[CRM Sync] Invalid source URL for item ${item.slug}, domain extraction failed`);
        }

        // 3. Find existing company (priority: domain > brand name)
        const {
          getCompanyByDomain,
          getCompanyByName,
          createCompany,
          linkItemToCompany
        } = await import('@/lib/db/queries/company.queries');

        let company = null;

        // Lookup by domain first (most reliable for deduplication)
        if (domain) {
          company = await getCompanyByDomain(domain);
          if (company) {
            console.log(`[CRM Sync] Found existing company by domain: ${company.id}`);
          }
        }

        // Fallback to brand name lookup (exact match)
        if (!company) {
          company = await getCompanyByName(brandName);
          if (company) {
            console.log(`[CRM Sync] Found existing company by name: ${company.id}`);
          }
        }

        // 4. Create new company if not found
        if (!company) {
          // Generate slug from brand name
          const slug = brandName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 50);

          company = await createCompany({
            name: brandName,
            website: item.source_url,
            domain: domain || undefined,
            slug,
            status: 'active',
          });

          console.log(`[CRM Sync] Created new company: ${company.id} (${company.name})`);
        }

        // 5. Link item to company (idempotent)
        const linkResult = await linkItemToCompany(item.slug, company.id);

        // 6. Sync company to CRM
        const { createTwentyCrmSyncServiceFromEnv } = await import(
          '@/lib/services/twenty-crm-sync-factory'
        );
        const { mapCompanyToTwentyCompany } = await import(
          '@/lib/mappers/twenty-crm.mapper'
        );

        const syncService = createTwentyCrmSyncServiceFromEnv();
        const companyPayload = mapCompanyToTwentyCompany(company);
        await syncService.upsertCompany(companyPayload);

        console.log(`[CRM Sync] ✅ Company ${company.id} synced for item ${item.slug}`, {
          companyId: company.id,
          companyName: company.name,
          brand: brandName,
          domain: domain || 'none',
          itemLinked: linkResult.created,
        });
      }
    } catch (error) {
      // Non-blocking: log error but don't fail item creation
      console.error(`[CRM Sync] ❌ Failed to sync company for item ${item.slug}:`, error);
    }

    return NextResponse.json({
      success: true,
      item,
      message: "Item created successfully",
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create item' 
      },
      { status: 500 }
    );
  }
} 