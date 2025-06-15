import { FilterProvider } from "@/components/filters";
import { getTranslations } from "next-intl/server";
import { Category, ItemData, Tag } from "@/lib/content";
import GlobalsClient from "./globals-client";
import Hero from "@/components/hero";

type ListingProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

export default async function Listing(props: ListingProps) {
  const t = await getTranslations("listing");

  return (
    <FilterProvider>
      <Hero
        badgeText={t("INTRODUCING_EVER_WORKS")}
        title={
          <div className="max-w-5xl font-bold text-balance text-3xl sm:text-4xl md:text-5xl">
            {t("THE_BEST")} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              {t("DIRECTORY_WEBSITE_TEMPLATE")}
            </span>
          </div>
        }
        description={t("DEMO_DESCRIPTION")}
        className="min-h-screen text-center"
      >
          <GlobalsClient {...props} />
      </Hero>
    </FilterProvider>
  );
}

export type { ListingProps };
