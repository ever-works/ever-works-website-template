import { NextRequest, NextResponse } from "next/server";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { CreateCategoryRequest, CategoryListOptions } from "@/lib/types/category";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/categories
 * List all categories with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const sortBy = searchParams.get('sortBy') as 'name' | 'sortOrder' | 'createdAt' || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc';

    const options: CategoryListOptions = {
      includeInactive,
      sortBy,
      sortOrder,
    };

    // Get categories
    const categories = await categoryRepository.findAll(options);

    return NextResponse.json({
      success: true,
      categories,
      total: categories.length,
    });

  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch categories' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
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
    const createData: CreateCategoryRequest = {
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    };

    // Validate required fields
    if (!createData.name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Create category
    const newCategory = await categoryRepository.create(createData);

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: "Category created successfully",
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create category:', error);
    
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
        error: error instanceof Error ? error.message : 'Failed to create category' 
      },
      { status: 500 }
    );
  }
} 