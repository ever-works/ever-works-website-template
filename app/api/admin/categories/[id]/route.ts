import { NextRequest, NextResponse } from "next/server";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { UpdateCategoryRequest } from "@/lib/types/category";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/categories/[id]
 * Get a specific category by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find category
    const category = await categoryRepository.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });

  } catch (error) {
    console.error('Failed to fetch category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch category' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categories/[id]
 * Update a specific category
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const updateData: UpdateCategoryRequest = {
      id,
      name: body.name,
    };

    // Update category
    const updatedCategory = await categoryRepository.update(updateData);

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: "Category updated successfully",
    });

  } catch (error) {
    console.error('Failed to update category:', error);
    
    // Handle not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 } // Conflict
      );
    }
    
    if (error instanceof Error && error.message.includes('must be')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 } // Bad Request
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update category' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a specific category (soft delete by default)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check for hard delete parameter
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Delete category
    if (hardDelete) {
      await categoryRepository.hardDelete(id);
    } else {
      await categoryRepository.delete(id);
    }

    return NextResponse.json({
      success: true,
      message: hardDelete 
        ? "Category permanently deleted" 
        : "Category deactivated successfully",
    });

  } catch (error) {
    console.error('Failed to delete category:', error);
    
    // Handle not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete category' 
      },
      { status: 500 }
    );
  }
} 