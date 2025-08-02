import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ItemRepository } from '@/lib/repositories/item.repository';

const itemRepository = new ItemRepository();

/**
 * GET /api/admin/items/stats
 * Get item statistics
 */
export async function GET() {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Get stats from repository
    const stats = await itemRepository.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Failed to fetch item stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch item stats' 
      },
      { status: 500 }
    );
  }
} 