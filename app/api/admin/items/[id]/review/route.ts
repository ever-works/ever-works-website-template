import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ItemRepository } from '@/lib/repositories/item.repository';
import { ReviewRequest } from '@/lib/types/item';

const itemRepository = new ItemRepository();

/**
 * POST /api/admin/items/[id]/review
 * Review and approve/reject an item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { status, review_notes }: ReviewRequest = body;

    // Validate review data
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Review status must be either 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Review the item
    const resolvedParams = await params;
    const item = await itemRepository.review(resolvedParams.id, {
      status,
      review_notes,
    });

    return NextResponse.json({
      success: true,
      item,
      message: `Item ${status} successfully`,
    });

  } catch (error) {
    console.error('Failed to review item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to review item' 
      },
      { status: 500 }
    );
  }
} 