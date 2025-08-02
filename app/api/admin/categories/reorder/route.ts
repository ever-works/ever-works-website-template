import { NextRequest, NextResponse } from "next/server";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { auth } from "@/lib/auth";

/**
 * PUT /api/admin/categories/reorder
 * Reorder categories based on provided array of IDs
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { categoryIds } = body;

    // Validate input
    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { success: false, error: "categoryIds must be an array" },
        { status: 400 }
      );
    }

    if (categoryIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "categoryIds array cannot be empty" },
        { status: 400 }
      );
    }

    // Check if all IDs are strings
    const invalidIds = categoryIds.filter(id => typeof id !== 'string');
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: "All category IDs must be strings" },
        { status: 400 }
      );
    }

    // Reorder categories
    await categoryRepository.reorder(categoryIds);

    return NextResponse.json({
      success: true,
      message: "Categories reordered successfully",
    });

  } catch (error) {
    console.error('Failed to reorder categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reorder categories' 
      },
      { status: 500 }
    );
  }
} 