import { fetchItems, fetchItem } from "@/lib/content";
import { MDX } from "@/components/mdx";
import { notFound } from "next/navigation";
import { getCategoriesName } from "@/lib/utils";
import { LOCALES } from "@/lib/constants";
import { getTranslations } from "next-intl/server";

export const revalidate = 10;

export async function generateStaticParams() {
  const params = LOCALES.map(async (locale) => {
    const { items } = await fetchItems({ lang: locale });
    return items.map((item) => ({ slug: item.slug, locale }));
  });

  return (await Promise.all(params)).flat();
}

export default async function ItemDetails({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const item = await fetchItem(slug, { lang: locale });
  if (!item) {
    return notFound();
  }

  const t = await getTranslations("common");

  const { meta, content } = item;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-extrabold">{meta.name}</h1>
      <span className="text-foreground-600">
        {getCategoriesName(meta.category)}
      </span>
      <p>{meta.description}</p>

      <div className="mt-8 max-w-[900px]">
        {content ? (
          <MDX source={content} />
        ) : (
          <p className="text-gray-400">{t("NO_CONTENT_PROVIDED")}</p>
        )}
      </div>
    </div>
  );
}
