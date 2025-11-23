import { getCachedItems } from "@/lib/content";
import TagsGridClient from "./tags-grid-client";
import { Suspense } from "react";
import { GridSkeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { getTagsEnabled } from "@/lib/utils/settings";

export const revalidate = 10;

export default async function TagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const tagsEnabled = getTagsEnabled();
  if (!tagsEnabled) {
    notFound();
  }

  const { locale } = await params;
  const { tags } = await getCachedItems({ lang: locale, sortTags: true });

  return (
    <Suspense fallback={<GridSkeleton count={12} />}>
      <TagsGridClient tags={tags} />
    </Suspense>
  );
}
