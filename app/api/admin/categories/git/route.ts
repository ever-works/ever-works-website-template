import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCategoryGitService } from "@/lib/services/category-git.service";

/**
 * GET /api/admin/categories/git
 * Get Git repository status and categories
 */
export async function GET() {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Parse DATA_REPOSITORY URL to extract owner and repo
    const dataRepo = process.env.DATA_REPOSITORY;
    if (!dataRepo) {
      return NextResponse.json(
        { 
          success: false, 
          error: "DATA_REPOSITORY not configured. Please set DATA_REPOSITORY environment variable." 
        },
        { status: 500 }
      );
    }

    // Extract owner and repo from URL like: https://github.com/ever-co/awesome-time-tracking-data
    const match = dataRepo.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid DATA_REPOSITORY format. Expected: https://github.com/owner/repo" 
        },
        { status: 500 }
      );
    }

    const [, owner, repo] = match;
    const gitConfig = {
      owner,
      repo,
      token: process.env.GITHUB_TOKEN || '',
      branch: process.env.GITHUB_BRANCH || 'main',
    };

    if (!gitConfig.token) {
      return NextResponse.json(
        { 
          success: false, 
          error: "GitHub token not configured. Please set GITHUB_TOKEN environment variable." 
        },
        { status: 500 }
      );
    }

    // Create Git service
    const gitService = await createCategoryGitService(gitConfig);
    
    // Get status and categories
    const status = await gitService.getStatus();
    const categories = await gitService.readCategories();

    return NextResponse.json({
      success: true,
      status,
      categories,
      message: "Git repository status retrieved successfully",
    });

  } catch (error) {
    console.error('Failed to get Git repository status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get Git repository status' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories/git
 * Create a new category via Git
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
    const { id, name } = body;

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: "Category ID and name are required" },
        { status: 400 }
      );
    }

    // Parse DATA_REPOSITORY URL to extract owner and repo
    const dataRepo = process.env.DATA_REPOSITORY;
    if (!dataRepo) {
      return NextResponse.json(
        { 
          success: false, 
          error: "DATA_REPOSITORY not configured. Please set DATA_REPOSITORY environment variable." 
        },
        { status: 500 }
      );
    }

    // Extract owner and repo from URL like: https://github.com/ever-co/awesome-time-tracking-data
    const match = dataRepo.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid DATA_REPOSITORY format. Expected: https://github.com/owner/repo" 
        },
        { status: 500 }
      );
    }

    const [, owner, repo] = match;
    const gitConfig = {
      owner,
      repo,
      token: process.env.GH_TOKEN || '',
      branch: process.env.GITHUB_BRANCH || 'main',
    };

    if (!gitConfig.token) {
      return NextResponse.json(
        { 
          success: false, 
          error: "GitHub token not configured. Please set GH_TOKEN environment variable." 
        },
        { status: 500 }
      );
    }

    // Create Git service and category
    const gitService = await createCategoryGitService(gitConfig);
    const newCategory = await gitService.createCategory({ id, name });

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: "Category created and committed to Git repository",
    });

  } catch (error) {
    console.error('Failed to create category via Git:', error);
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 } // Conflict
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create category via Git' 
      },
      { status: 500 }
    );
  }
} 