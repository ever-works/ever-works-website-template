import { getCachedItems } from "@/lib/content";
import TagsGridClient from "./tags-grid-client";
import { Suspense } from "react";
import { GridSkeleton } from "@/components/ui/skeleton";

export const revalidate = 10;

export default async function TagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { tags } = await getCachedItems({ lang: locale, sortTags: true });

  return (
    <Suspense fallback={<GridSkeleton count={12} />}>
      <TagsGridClient tags={tags} />
    </Suspense>
  );
}
