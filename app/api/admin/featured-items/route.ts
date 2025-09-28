import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { featuredItems } from '@/lib/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';

// GET /api/admin/featured-items - Get all featured items
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
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

// POST /api/admin/featured-items - Create a new featured item
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
