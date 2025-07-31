import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ItemRepository } from '@/lib/repositories/item.repository';
import { UpdateItemRequest } from '@/lib/types/item';

const itemRepository = new ItemRepository();

/**
 * GET /api/admin/items/[id]
 * Get a specific item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const item = await itemRepository.findById(params.id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item,
    });

  } catch (error) {
    console.error('Failed to fetch item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch item' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/items/[id]
 * Update a specific item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updateData: UpdateItemRequest = {
      id: params.id,
      ...body,
    };

    const item = await itemRepository.update(params.id, updateData);

    return NextResponse.json({
      success: true,
      item,
      message: "Item updated successfully",
    });

  } catch (error) {
    console.error('Failed to update item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update item' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/items/[id]
 * Delete a specific item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await itemRepository.delete(params.id);

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });

  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete item' 
      },
      { status: 500 }
    );
  }
} 