import { fetchByTag, fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import Listing from "../../listing";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsTags(locale: string) {
    const { tags } = await fetchItems({ lang: locale });
    const paths = [];

    for (const tag of tags) {
      const pages = totalPages(tag.count || 0);

      for (let i = 1; i <= pages; ++i) {
        if (i === 1) {
          paths.push({ tag: [tag.id], locale });
        } else {
          paths.push({ tag: [tag.id, i.toString()], locale });
        }
      }
    }

    return paths;
  }

  const params = LOCALES.map((locale) => fetchItemsTags(locale));

  return (await Promise.all(params)).flat();
}

export default async function TagListing({
  params,
}: {
  params: Promise<{ tag: string[]; locale: string }>;
}) {
  const { tag: tagMeta, locale } = await params;
  const [rawTag, rawPage] = tagMeta;
  const tag = decodeURI(rawTag);
  const { start, page } = paginateMeta(rawPage);
  const { items, categories, total, tags } = await fetchByTag(tag, {
    lang: locale,
  });

  return (
    <Listing
      categories={categories}
      tags={tags}
      items={items}
      start={start}
      page={page}
      total={total}
      basePath={`/tags/${tag}`}
    />
  );
}
