import { fetchItems, fetchItem } from "@/lib/content";
import { notFound } from "next/navigation";
import { getCategoriesName } from "@/lib/utils";
import { LOCALES } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import { ItemDetail } from "@/components/item-detail";
import { Container } from "@/components/ui/container";
import { Suspense } from "react";

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
  const categoryName = getCategoriesName(meta.category);

  const metaWithVideo = {
    ...meta,
    video_url: "", // e.g. https://www.youtube.com/watch?v=eDqfg_LexCQ
  };

  return (
    <Container maxWidth="7xl" padding="default">
      <Suspense fallback={<div>Loading...</div>}>
        <ItemDetail
          meta={metaWithVideo}
          content={content}
          categoryName={categoryName}
          noContentMessage={t("NO_CONTENT_PROVIDED")}
        />
      </Suspense>
    </Container>
  );
}
