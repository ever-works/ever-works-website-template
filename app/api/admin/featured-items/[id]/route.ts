import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { featuredItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/featured-items/[id] - Get a specific featured item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const featuredItem = await db
      .select()
      .from(featuredItems)
      .where(eq(featuredItems.id, id))
      .limit(1);

    if (featuredItem.length === 0) {
      return NextResponse.json(
        { error: 'Featured item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: featuredItem[0],
    });
  } catch (error) {
    console.error('Error fetching featured item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured item' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/featured-items/[id] - Update a featured item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      itemName,
      itemIconUrl,
      itemCategory,
      itemDescription,
      featuredOrder,
      featuredUntil,
      isActive,
    } = body;

    const { id } = await params;
    // Update featured item
    const updatedItem = await db
      .update(featuredItems)
      .set({
        itemName,
        itemIconUrl,
        itemCategory,
        itemDescription,
        featuredOrder,
        featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(featuredItems.id, id))
      .returning();

    if (updatedItem.length === 0) {
      return NextResponse.json(
        { error: 'Featured item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem[0],
      message: 'Featured item updated successfully',
    });
  } catch (error) {
    console.error('Error updating featured item:', error);
    return NextResponse.json(
      { error: 'Failed to update featured item' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/featured-items/[id] - Remove a featured item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Soft delete by setting isActive to false
    const updatedItem = await db
      .update(featuredItems)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(featuredItems.id, id))
      .returning();

    if (updatedItem.length === 0) {
      return NextResponse.json(
        { error: 'Featured item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Featured item removed successfully',
    });
  } catch (error) {
    console.error('Error removing featured item:', error);
    return NextResponse.json(
      { error: 'Failed to remove featured item' },
      { status: 500 }
    );
  }
}
