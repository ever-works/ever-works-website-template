import { fetchItems } from "@/lib/content";
import { LOCALES } from "@/lib/constants";
import ListingCategories from "../../listing-categories";

export const revalidate = 10;

export async function generateStaticParams() {
  async function fetchItemsPages(locale: string) {
    // No need to fetch items, just return one page for each locale
    const paths = [];
    const pages = 1; // No pagination needed for categories grid
    for (let i = 1; i <= pages; ++i) {
      paths.push({ page: i.toString(), locale });
    }
    return paths;
  }
  const params = LOCALES.map((locale) => fetchItemsPages(locale));
  return (await Promise.all(params)).flat();
}

export default async function CategoryPagingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; 
  const { categories } = await fetchItems({ lang: locale });
  return <ListingCategories categories={categories} />;
}
