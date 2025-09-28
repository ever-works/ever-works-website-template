import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { featuredItems } from '@/lib/db/schema';
import { eq, desc, and, gte, or, isNull } from 'drizzle-orm';

// GET /api/featured-items - Get active featured items for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Build query conditions for active featured items
    const conditions = [eq(featuredItems.isActive, true)];
    
    // If not including expired, filter out items past their featured_until date
    if (!includeExpired) {
      const currentDate = new Date();
      const expirationCondition = or(
        isNull(featuredItems.featuredUntil),
        gte(featuredItems.featuredUntil, currentDate)
      );

      if (expirationCondition) {
        conditions.push(expirationCondition);
      }
    }

    // Get featured items
    const featuredItemsList = await db
      .select()
      .from(featuredItems)
      .where(and(...conditions))
      .orderBy(desc(featuredItems.featuredOrder), desc(featuredItems.featuredAt))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: featuredItemsList,
      count: featuredItemsList.length,
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured items' },
      { status: 500 }
    );
  }
}
