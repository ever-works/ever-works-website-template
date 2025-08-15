import { fetchItems } from "@/lib/content";
import TagsGridClient from "./tags-grid-client";
import { Suspense } from "react";

export const revalidate = 10;

export default async function TagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { tags } = await fetchItems({ lang: locale, sortTags: true });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TagsGridClient tags={tags} />
    </Suspense>
  );
}
