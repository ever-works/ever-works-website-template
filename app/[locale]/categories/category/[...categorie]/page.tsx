import { fetchByCategory, fetchItems } from "@/lib/content";
import { paginateMeta, totalPages } from "@/lib/paginate";
import { LOCALES } from "@/lib/constants";
import ListingCategories from "../../listing-categories";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsTags(locale: string) {
    const { categories } = await fetchItems({ lang: locale });
    const paths = [];

    for (const categorie of categories) {
      const pages = totalPages(categorie.count || 0);

      for (let i = 1; i <= pages; ++i) {
        if (i === 1) {
          paths.push({ categorie: [categorie.id], locale });
        } else {
          paths.push({ categorie: [categorie.id, i.toString()], locale });
        }
      }
    }

    return paths;
  }

  const params = LOCALES.map((locale) => fetchItemsTags(locale));

  return (await Promise.all(params)).flat();
}

export default async function CategoryListing({
  params,
}: {
  params: Promise<{ categorie: string[]; locale: string }>;
}) {
  const resolvedParams = await params;
  const { categorie: categorieMeta, locale } = resolvedParams;
  const [rawCategorie, rawPage] = categorieMeta;
  const categorie = decodeURI(rawCategorie);
  const { start, page } = paginateMeta(rawPage || "1");
  const { items, categories, total } = await fetchByCategory(categorie, {
    lang: locale,
  });

  return (
    <ListingCategories
      total={total}
      start={start}
      page={page}
      basePath={`/categories/category/${categorie}`}
      categories={categories}
      tags={[]}
      items={items}
    />
  );
}
