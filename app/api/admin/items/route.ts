import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ItemRepository } from '@/lib/repositories/item.repository';
import { CreateItemRequest } from '@/lib/types/item';

const itemRepository = new ItemRepository();

/**
 * GET /api/admin/items
 * List items with pagination and filtering
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;

    // Get paginated items
    const result = await itemRepository.findAllPaginated(page, limit, {
      status: status as any,
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
 * POST /api/admin/items
 * Create a new item
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