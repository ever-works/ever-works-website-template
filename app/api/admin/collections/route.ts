import { NextRequest, NextResponse } from "next/server";
import { collectionRepository } from "@/lib/repositories/collection.repository";
import { CreateCollectionRequest, CollectionListOptions } from "@/types/collection";
import { auth } from "@/lib/auth";
import { validatePaginationParams } from "@/lib/utils/pagination-validation";
import { invalidateContentCaches } from "@/lib/cache-invalidation";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paginationResult = validatePaginationParams(searchParams);
    if ("error" in paginationResult) {
      return NextResponse.json(
        { success: false, error: paginationResult.error },
        { status: paginationResult.status }
      );
    }

    const { page, limit } = paginationResult;
    const includeInactive = searchParams.get("includeInactive") === "true";
    const search = searchParams.get("search") || undefined;
    const sortByParam = searchParams.get("sortBy");
    const sortBy = sortByParam === "item_count" || sortByParam === "created_at" ? sortByParam : "name";
    const sortOrderParam = searchParams.get("sortOrder");
    const sortOrder = sortOrderParam === "desc" ? "desc" : "asc";

    const options: CollectionListOptions = {
      includeInactive,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    };

    const result = await collectionRepository.findAllPaginated(options);

    return NextResponse.json({
      success: true,
      collections: result.collections,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const createData: CreateCollectionRequest = {
      id: body.id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      icon_url: body.icon_url,
      isActive: body.isActive,
    };

    if (!createData.id || !createData.name) {
      return NextResponse.json(
        { success: false, error: "Collection ID and name are required" },
        { status: 400 }
      );
    }

    const newCollection = await collectionRepository.create(createData);
    await invalidateContentCaches();
    // Revalidate public collection pages
    revalidatePath("/collections");
    revalidatePath(`/collections/${newCollection.slug}`);

    return NextResponse.json(
      { success: true, collection: newCollection, message: "Collection created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create collection:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 });
    }

    if (error instanceof Error && error.message.includes("must")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create collection" },
      { status: 500 }
    );
  }
}
