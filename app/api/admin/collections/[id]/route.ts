import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { collectionRepository } from "@/lib/repositories/collection.repository";
import { UpdateCollectionRequest } from "@/types/collection";
import { auth } from "@/lib/auth";
import { invalidateContentCaches } from "@/lib/cache-invalidation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const collection = await collectionRepository.findById(id);

    if (!collection) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    console.error("Failed to fetch collection:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: UpdateCollectionRequest = {
      id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      icon_url: body.icon_url,
      isActive: body.isActive,
    };

    const updated = await collectionRepository.update(updateData);
    await invalidateContentCaches();

    // Ensure collection detail/list pages pick up the new active state without manual refresh
    const targetSlug = updated.slug || updateData.slug || id;
    revalidatePath(`/collections/${targetSlug}`);
    revalidatePath(`/collections`);

    return NextResponse.json({ success: true, data: updated, message: "Collection updated successfully" });
  } catch (error) {
    console.error("Failed to update collection:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 });
    }

    if (error instanceof Error && error.message.includes("must")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await collectionRepository.delete(id);
    await invalidateContentCaches();

    // Invalidate collection detail/list pages for removed collection
    revalidatePath(`/collections/${id}`);
    revalidatePath(`/collections`);

    return NextResponse.json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete collection" },
      { status: 500 }
    );
  }
}
