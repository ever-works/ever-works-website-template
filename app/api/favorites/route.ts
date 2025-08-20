import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { favorites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const addFavoriteSchema = z.object({
  itemSlug: z.string().min(1),
  itemName: z.string().min(1),
  itemIconUrl: z.string().optional(),
  itemCategory: z.string().optional(),
});


export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, session.user.id))
      .orderBy(favorites.createdAt);

    return NextResponse.json({
      success: true,
      favorites: userFavorites,
    });

  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch favorites' 
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addFavoriteSchema.parse(body);

    // Check if favorite already exists
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.itemSlug, validatedData.itemSlug)
        )
      )
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(
        { success: false, error: "Item is already in favorites" },
        { status: 409 }
      );
    }

    const newFavorite = await db
      .insert(favorites)
      .values({
        userId: session.user.id,
        itemSlug: validatedData.itemSlug,
        itemName: validatedData.itemName,
        itemIconUrl: validatedData.itemIconUrl,
        itemCategory: validatedData.itemCategory,
      })
      .returning();

    return NextResponse.json({
      success: true,
      favorite: newFavorite[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to add favorite:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add favorite' 
      },
      { status: 500 }
    );
  }
}
