import { fetchItems } from "@/lib/content";
import TagsGridClient from "./tags-grid-client";

export const revalidate = 10;

export default async function TagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { tags } = await fetchItems({ lang: locale, sortTags: true });

  return <TagsGridClient tags={tags} />;
}
