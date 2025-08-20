import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { favorites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * DELETE /api/favorites/[itemSlug]
 * Remove a favorite by item slug
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemSlug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { itemSlug } = await params;

    // Check if favorite exists
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.itemSlug, itemSlug)
        )
      )
      .limit(1);

    if (existingFavorite.length === 0) {
      return NextResponse.json(
        { success: false, error: "Favorite not found" },
        { status: 404 }
      );
    }

    // Delete the favorite
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.itemSlug, itemSlug)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Favorite removed successfully",
    });

  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove favorite' 
      },
      { status: 500 }
    );
  }
}
