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
          <>
            {t("THE_BEST")} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              {t("DIRECTORY_WEBSITE_TEMPLATE")}
            </span>
          </>
        }
        description={t("DEMO_DESCRIPTION")}
        className="min-h-screen"
      >
        <div className="container mx-auto px-4 mt-4">
          <GlobalsClient {...props} />
        </div>
      </Hero>
    </FilterProvider>
  );
}

export type { ListingProps };
